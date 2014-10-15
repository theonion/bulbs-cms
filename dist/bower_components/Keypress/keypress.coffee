###
Copyright 2014 David Mauro

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Keypress is a robust keyboard input capturing Javascript utility
focused on input for games.

version 2.0.3
###

###
Combo options available and their defaults:
    keys            : []            - An array of the keys pressed together to activate combo.
    count           : 0             - The number of times a counting combo has been pressed. Reset on release.
    is_unordered    : false         - Unless this is set to true, the keys can be pressed down in any order.
    is_counting     : false         - Makes this a counting combo (see documentation).
    is_exclusive    : false         - This combo will replace other exclusive combos when true.
    is_solitary     : false         - This combo will only fire if ONLY it's keys are pressed down.
    is_sequence     : false         - Rather than a key combo, this is an ordered key sequence.
    prevent_default : false         - Prevent default behavior for all component key keypresses.
    prevent_repeat  : false         - Prevent the combo from repeating when keydown is held.
    on_keydown      : null          - A function that is called when the combo is pressed.
    on_keyup        : null          - A function that is called when the combo is released.
    on_release      : null          - A function that is called when all keys in the combo are released.
    this            : undefined     - Defines the scope for your callback functions.
###

###########
# Constants
###########

_factory_defaults =
    is_unordered    : false
    is_counting     : false
    is_exclusive    : false
    is_solitary     : false
    prevent_default : false
    prevent_repeat  : false

_modifier_keys = ["meta", "alt", "option", "ctrl", "shift", "cmd"]

_metakey = "ctrl"

###########################
# Public object and Classes
###########################

keypress = {}

keypress.debug = false

class Combo
    constructor: (dictionary) ->
        # Copy over any non-false values
        for own property, value of dictionary
            @[property] = value if value != false

        # Standard Defaults
        @keys = @keys or []
        @count = @count or 0

    allows_key_repeat: ->
        # Combos with keydown functions should be able to rapid fire
        # when holding down the key for an extended period
        return not @prevent_repeat and typeof @on_keydown is "function"

    reset: ->
        @count = 0
        @keyup_fired = null

class keypress.Listener
    constructor:(element, defaults) ->
        # Public properties
        @should_suppress_event_defaults = false
        @should_force_event_defaults = false
        @sequence_delay = 800

        # Private properties
        @_registered_combos = []
        @_keys_down = []
        @_active_combos = []
        @_sequence = []
        @_sequence_timer = null
        @_prevent_capture = false
        @_defaults = defaults or {}
        for own property, value of _factory_defaults
            @_defaults[property] = @_defaults[property] or value

        # Attach handlers to element
        element = element or document.body

        attach_handler = (target, event, handler) ->
            if target.addEventListener
                target.addEventListener event, handler
            else if target.attachEvent
                target.attachEvent "on#{event}", handler

        attach_handler element, "keydown", (e) =>
            e = e or window.event
            @_receive_input e, true
            @_bug_catcher e
        attach_handler element, "keyup", (e) =>
            e = e or window.event
            @_receive_input e, false
        attach_handler window, "blur", =>
            # Assume all keys are released when we can't catch key events
            # This prevents alt+tab conflicts
            for key in @_keys_down
                @_key_up key, {}
            @_keys_down = []

    # Helper Methods

    _bug_catcher: (e) ->
        # This seems to be Mac specific weirdness, so we'll target "cmd" as metaKey
        # Force a keyup for non-modifier keys when command is held because they don't fire
        if _metakey is "cmd" and "cmd" in @_keys_down and _convert_key_to_readable(e.keyCode) not in ["cmd", "shift", "alt", "caps", "tab"]
            @_receive_input e, false
        # Note: we're currently ignoring the fact that this doesn't catch the bug that a keyup
        # will not fire if you keydown a combo, then press and hold cmd, then keyup the combo.
        # Perhaps we should fire keyup on all active combos when we press cmd?

    _cmd_bug_check: (combo_keys) ->
        # We don't want to allow combos to activate if the cmd key
        # is pressed, but cmd isn't in them. This is so they don't
        # accidentally rapid fire due to our hack-around for the cmd
        # key bug and having to fake keyups.
        if _metakey is "cmd" and "cmd" in @_keys_down and "cmd" not in combo_keys
            return false
        return true

    _prevent_default: (e, should_prevent) ->
        # If we've pressed a combo, or if we are working towards
        # one, we should prevent the default keydown event.
        if (should_prevent or @should_suppress_event_defaults) and not @should_force_event_defaults
            if e.preventDefault then e.preventDefault() else e.returnValue = false    
            e.stopPropagation() if e.stopPropagation

    # Tracking Combos

    _get_active_combos: (key) ->
        # Based on the keys_down and the key just pressed or released
        # (which should not be in keys_down), we determine if any
        # combo in registered_combos could be considered active.
        # This will return an array of active combos

        active_combos = []

        # First check that every key in keys_down maps to a combo
        keys_down = _filter_array @_keys_down, (down_key) ->
            down_key isnt key
        keys_down.push key

        # Get perfect matches
        @_match_combo_arrays keys_down, (match) =>
            active_combos.push(match) if @_cmd_bug_check match.keys

        # Get fuzzy matches
        @_fuzzy_match_combo_arrays keys_down, (match) =>
            return if match in active_combos
            active_combos.push(match) unless match.is_solitary or not @_cmd_bug_check match.keys
        
        return active_combos

    _get_potential_combos: (key) ->
        # Check if we are working towards pressing a combo.
        # Used for preventing default on keys that might match
        # to a combo in the future.
        potentials = []
        for combo in @_registered_combos
            continue if combo.is_sequence
            potentials.push(combo) if key in combo.keys and @_cmd_bug_check combo.keys
        return potentials

    _add_to_active_combos: (combo) ->
        should_replace = false
        should_prepend = true
        already_replaced = false
        # An active combo is any combo which the user has already entered.
        # We use this to track when a user has released the last key of a
        # combo for on_release, and to keep combos from 'overlapping'.
        if combo in @_active_combos
            return true
        else if @_active_combos.length
            # We have to check if we're replacing another active combo
            # So compare the combo.keys to all active combos' keys.
            for i in [0...@_active_combos.length]
                active_combo = @_active_combos[i]
                continue unless active_combo and active_combo.is_exclusive and combo.is_exclusive
                active_keys = active_combo.keys
                unless should_replace
                    for active_key in active_keys
                        should_replace = true
                        unless active_key in combo.keys
                            should_replace = false
                            break

                if should_prepend and not should_replace
                    for combo_key in combo.keys
                        should_prepend = false
                        unless combo_key in active_keys
                            should_prepend = true
                            break

                if should_replace
                    if already_replaced
                        active_combo = @_active_combos.splice(i, 1)[0]
                        active_combo.reset() if active_combo?
                    else
                        active_combo =  @_active_combos.splice(i, 1, combo)[0]
                        active_combo.reset() if active_combo?
                        already_replaced = true
                    should_prepend = false
        if should_prepend
            @_active_combos.unshift combo

        return should_replace or should_prepend

    _remove_from_active_combos: (combo) ->
        for i in [0...@_active_combos.length]
            active_combo = @_active_combos[i]
            if active_combo is combo
                combo = @_active_combos.splice(i, 1)[0]
                combo.reset()
                break
        return

    # Sequence Methods

    _get_possible_sequences: ->
        # Determine what if any sequences we're working towards.
        # We will consider any which any part of the end of the sequence
        # matches and return all of them.
        matches = []
        for combo in @_registered_combos
            for j in [1..@_sequence.length]
                sequence = @_sequence.slice -j
                continue unless combo.is_sequence
                unless "shift" in combo.keys
                    sequence = _filter_array sequence, (key) ->
                        return key isnt "shift"
                    continue unless sequence.length
                for i in [0...sequence.length]
                    if combo.keys[i] is sequence[i]
                        match = true
                    else
                        match = false
                        break
                matches.push(combo) if match
        return matches

    _add_key_to_sequence: (key, e) ->
        @_sequence.push key
        # Now check if they're working towards a sequence
        sequence_combos = @_get_possible_sequences()
        if sequence_combos.length
            for combo in sequence_combos
                @_prevent_default e, combo.prevent_default
            # If we're working towards one, give them more time to keep going
            clearTimeout(@_sequence_timer) if @_sequence_timer
            if @sequence_delay > -1
                @_sequence_timer = setTimeout ->
                    @_sequence = []
                , @sequence_delay
        else
            # If we're not working towards something, just clear it out
            @_sequence = []
        return

    _get_sequence: (key) ->
        # Compare _sequence to all combos
        for combo in @_registered_combos
            continue unless combo.is_sequence
            for j in [1..@_sequence.length]
                # As we are traversing backwards through the sequence keys,
                # Take out any shift keys, unless shift is in the combo.
                sequence = (_filter_array @_sequence, (seq_key) ->
                    return true if "shift" in combo.keys
                    return seq_key isnt "shift"
                ).slice -j
                continue unless combo.keys.length is sequence.length
                for i in [0...sequence.length]
                    seq_key = sequence[i]
                    # Special case for shift. Ignore shift keys, unless the sequence explicitly uses them
                    continue if seq_key is "shift" unless "shift" in combo.keys
                    # Don't select this combo if we're pressing shift and shift isn't in it
                    continue if key is "shift" and "shift" not in combo.keys
                    if combo.keys[i] is seq_key
                        match = true
                    else
                        match = false
                        break
            return combo if match
        return false

    # Catching Combos

    _receive_input: (e, is_keydown) ->
        # If we're not capturing input, we should
        # clear out _keys_down for good measure
        if @_prevent_capture
            @_keys_down = [] if @_keys_down.length
            return
        key = _convert_key_to_readable e.keyCode
        # Catch tabbing out of a non-capturing state
        if !is_keydown and !@_keys_down.length and key in ["alt", _metakey]
            return
        return unless key
        if is_keydown
            @_key_down key, e
        else
            @_key_up key, e
        
    _fire: (event, combo, key_event, is_autorepeat) ->
        # Only fire this event if the function is defined
        if typeof combo["on_" + event] is "function"
            @_prevent_default key_event, (combo["on_" + event].call(combo.this, key_event, combo.count, is_autorepeat) isnt true)
        # We need to mark that keyup has already happened
        if event is "release"
            combo.count = 0
        if event is "keyup"
            combo.keyup_fired = true

    _match_combo_arrays: (potential_match, match_handler) ->
        # This will return all combos that match
        for source_combo in @_registered_combos
            if (not source_combo.is_unordered and _compare_arrays_sorted(potential_match, source_combo.keys)) or (source_combo.is_unordered and _compare_arrays(potential_match, source_combo.keys))
                match_handler source_combo
        return

    _fuzzy_match_combo_arrays: (potential_match, match_handler) ->
        # This will return combos that match even if other keys are pressed
        for source_combo in @_registered_combos
            if (not source_combo.is_unordered and _is_array_in_array_sorted(source_combo.keys, potential_match)) or (source_combo.is_unordered and _is_array_in_array(source_combo.keys, potential_match))
                match_handler source_combo
        return

    _keys_remain: (combo) ->
        for key in combo.keys
            if key in @_keys_down
                keys_remain = true
                break
        return keys_remain

    _key_down: (key, e) ->
        # Check if we're holding shift
        shifted_key = _convert_to_shifted_key key, e
        key = shifted_key if shifted_key

        # Add the key to sequences
        @_add_key_to_sequence key, e
        sequence_combo = @_get_sequence key
        @_fire("keydown", sequence_combo, e) if sequence_combo

        # We might have modifier keys down when coming back to
        # this window and they might not be in _keys_down, so
        # we're doing a check to make sure we put it back in.
        # This only works for explicit modifier keys.
        for mod, event_mod of _modifier_event_mapping
            continue unless e[event_mod]
            continue if mod is key or mod in @_keys_down
            @_keys_down.push mod
        # Alternatively, we might not have modifier keys down
        # that we think are, so we should catch those too
        for mod, event_mod of _modifier_event_mapping
            continue if mod is key
            if mod in @_keys_down and not e[event_mod]
                # The Windows key will think it is the cmd key, but won't trigger the event mod 
                continue if mod is "cmd" and _metakey isnt "cmd"
                for i in [0...@_keys_down.length]
                    @_keys_down.splice(i, 1) if @_keys_down[i] is mod

        # Find which combos we have pressed or might be working towards, and prevent default
        combos = @_get_active_combos key
        potential_combos = @_get_potential_combos key
        for combo in combos
            @_handle_combo_down combo, potential_combos, key, e
        if potential_combos.length
            for potential in potential_combos
                @_prevent_default e, potential.prevent_default

        if key not in @_keys_down
            @_keys_down.push key
        return

    _handle_combo_down: (combo, potential_combos, key, e) ->
        # Make sure we're not trying to fire for a combo that already fired
        return false unless key in combo.keys

        @_prevent_default e, (combo and combo.prevent_default)

        is_autorepeat = false
        # If we've already pressed this key, check that we want to fire
        # again, otherwise just add it to the keys_down list.
        if key in @_keys_down
            is_autorepeat = true
            return false unless combo.allows_key_repeat()

        # Now we add this combo or replace it in _active_combos
        result = @_add_to_active_combos combo, key

        # We reset the keyup_fired property because you should be
        # able to fire that again, if you've pressed the key down again
        combo.keyup_fired = false

        # Now we fire the keydown event unless there is a larger exclusive potential combo
        is_other_exclusive = false
        if combo.is_exclusive
            for potential_combo in potential_combos
                if potential_combo.is_exclusive and potential_combo.keys.length > combo.keys.length
                    is_other_exclusive = true
                    break

        unless is_other_exclusive
            if combo.is_counting and typeof combo.on_keydown is "function"
                combo.count += 1

            # Only fire keydown if we added it
            if result
                @_fire "keydown", combo, e, is_autorepeat

    _key_up: (key, e) ->
        # Check if we're holding shift
        unshifted_key = key
        shifted_key = _convert_to_shifted_key key, e
        key = shifted_key if shifted_key
        shifted_key = _keycode_shifted_keys[unshifted_key]
        # We have to make sure the key matches to what we had in _keys_down
        if e.shiftKey
            key = unshifted_key unless shifted_key and shifted_key in @_keys_down
        else
            key = shifted_key unless unshifted_key and unshifted_key in @_keys_down

        # Check if we have a keyup firing
        sequence_combo = @_get_sequence key
        @_fire("keyup", sequence_combo, e) if sequence_combo

        # Remove from the list
        return false unless key in @_keys_down
        for i in [0...@_keys_down.length]
            if @_keys_down[i] in [key, shifted_key, unshifted_key]
                @_keys_down.splice i, 1
                break

        # Store this for later cleanup
        active_combos_length = @_active_combos.length

        # When releasing we should only check if we
        # match from _active_combos so that we don't
        # accidentally fire for a combo that was a
        # smaller part of the one we actually wanted.
        combos = []
        for active_combo in @_active_combos
            if key in active_combo.keys
                combos.push active_combo
        for combo in combos
            @_handle_combo_up combo, e, key

        # We also need to check other combos that might still be in active_combos
        # and needs to be removed from it.
        if active_combos_length > 1
            for active_combo in @_active_combos
                continue if active_combo is undefined or active_combo in combos
                unless @_keys_remain active_combo
                    @_remove_from_active_combos active_combo
        return

    _handle_combo_up: (combo, e, key) ->
        @_prevent_default e, (combo and combo.prevent_default)
        
        # Check if any keys from this combo are still being held.
        keys_remaining = @_keys_remain combo

        # Any unactivated combos will fire
        if !combo.keyup_fired
            # And we should not fire it if it is a solitary combo and something else is pressed
            keys_down = @_keys_down.slice()
            keys_down.push key
            if not combo.is_solitary or _compare_arrays keys_down, combo.keys
                @_fire "keyup", combo, e
                # Dont' add to the count unless we only have a keyup callback
                if combo.is_counting and typeof combo.on_keyup is "function" and typeof combo.on_keydown isnt "function"
                    combo.count += 1

        # If this was the last key released of the combo, clean up.
        unless keys_remaining
            @_fire "release", combo, e
            @_remove_from_active_combos combo
        return

    # Public Registration Methods

    simple_combo: (keys, callback) ->
        # Shortcut for simple combos.
        @register_combo(
            keys            : keys
            on_keydown      : callback
        )

    counting_combo: (keys, count_callback) ->
        # Shortcut for counting combos
        @register_combo(
            keys            : keys
            is_counting     : true
            is_unordered    : false
            on_keydown      : count_callback
        )

    sequence_combo: (keys, callback) ->
        @register_combo(
            keys            : keys
            on_keydown      : callback
            is_sequence     : true
        )

    register_combo: (combo_dictionary) ->
        # Allow a space dilineated string instead of array
        if typeof combo_dictionary["keys"] is "string"
            combo_dictionary["keys"] = combo_dictionary["keys"].split " "
        for own property, value of @_defaults
            if combo_dictionary[property] is undefined
                combo_dictionary[property] = value
        combo = new Combo combo_dictionary
        
        if _validate_combo combo
            @_registered_combos.push combo
            return combo

    register_many: (combo_array) ->
        # Will return an array of the combos actually registered
        @register_combo(combo) for combo in combo_array

    unregister_combo: (keys_or_combo) ->
        return false unless keys_or_combo

        unregister_combo = (combo) =>
            for i in [0...@_registered_combos.length]
                if combo is @_registered_combos[i]
                    @_registered_combos.splice i, 1
                    break

        if keys_or_combo.keys?
            unregister_combo keys_or_combo
        else
            if typeof keys_or_combo is "string"
                keys_or_combo = keys_or_combo.split " "
            for combo in @_registered_combos
                continue unless combo?
                if (combo.is_unordered and _compare_arrays(keys_or_combo, combo.keys)) or (not combo.is_unordered and _compare_arrays_sorted(keys_or_combo, combo.keys))
                    unregister_combo combo

    unregister_many: (combo_array) ->
        for combo in combo_array
            @unregister_combo combo

    # Other public methods

    get_registered_combos: ->
        return @_registered_combos

    reset: ->
        @_registered_combos = []

    listen: ->
        @_prevent_capture = false

    stop_listening: ->
        @_prevent_capture = true

    get_meta_key: ->
        # Helpful for debugging purposes
        return _metakey

##################
# Helper Functions
##################

_decide_meta_key = ->
    # If the useragent reports Mac OS X, assume cmd is metakey
    if navigator.userAgent.indexOf("Mac OS X") != -1
        _metakey = "cmd"
    return

_change_keycodes_by_browser = ->
    if navigator.userAgent.indexOf("Opera") != -1
        # Opera does weird stuff with command and control keys, let's fix that.
        # Note: Opera cannot override meta + s browser default of save page.
        # Note: Opera does some really strange stuff when cmd+alt+shift
        # are held and a non-modifier key is pressed.
        _keycode_dictionary["17"] = "cmd"
    return

_convert_key_to_readable = (k) ->
    return _keycode_dictionary[k]

_filter_array = (array, callback) ->
  if array.filter
    return array.filter(callback)
  else
    # For browsers without Array.prototype.filter like IE<9:
    return (element for element in array when callback(element))

_compare_arrays = (a1, a2) ->
    # This will ignore the ordering of the arrays
    # and simply check if they have the same contents.
    return false unless a1.length is a2.length
    for item in a1
        continue if item in a2
        return false
    return true

_compare_arrays_sorted = (a1, a2) ->
    return false unless a1.length is a2.length
    for i in [0...a1.length]
        return false unless a1[i] is a2[i]
    return true

_is_array_in_array = (a1, a2) ->
    # Returns true only if all of the contents of
    # a1 are included in a2
    for item in a1
        return false unless item in a2
    return true

_index_of_in_array = Array.prototype.indexOf or (a, item) ->
    for i in [0..a.length]
        return i if a[i] is item
    return -1

_is_array_in_array_sorted = (a1, a2) ->
    # Return true only if all of the contents of
    # a1 are include in a2 and they appear in the
    # same order in both.
    prev = 0
    for item in a1
        index = _index_of_in_array.call a2, item
        if index >= prev
            prev = index
        else
            return false
    return true

_log_error = () ->
    console.log arguments... if keypress.debug

_key_is_valid = (key) ->
    valid = false
    for _, valid_key of _keycode_dictionary
        if key is valid_key
            valid = true
            break
    unless valid
        for _, valid_key of _keycode_shifted_keys
            if key is valid_key
                valid = true
                break
    return valid

_validate_combo = (combo) ->
    validated = true

    # Warn for lack of keys
    unless combo.keys.length
        _log_error "You're trying to bind a combo with no keys:", combo

    # Convert "meta" to either "ctrl" or "cmd"
    # Don't explicity use the command key, it breaks
    # because it is the windows key in Windows, and
    # cannot be hijacked.
    for i in [0...combo.keys.length]
        key = combo.keys[i]
        # Check the name and replace if needed
        alt_name = _keycode_alternate_names[key]
        key = combo.keys[i] = alt_name if alt_name
        if key is "meta"
            combo.keys.splice i, 1, _metakey
        if key is "cmd"
            _log_error "Warning: use the \"meta\" key rather than \"cmd\" for Windows compatibility"

    # Check that all keys in the combo are valid
    for key in combo.keys
        unless _key_is_valid key
            _log_error "Do not recognize the key \"#{key}\""
            validated = false

    # We can only allow a single non-modifier key
    # in combos that include the command key (this
    # includes 'meta') because of the keyup bug.
    if "meta" in combo.keys or "cmd" in combo.keys
        non_modifier_keys = combo.keys.slice()
        for mod_key in _modifier_keys
            if (i = _index_of_in_array.call(non_modifier_keys, mod_key)) > -1
                non_modifier_keys.splice(i, 1) 
        if non_modifier_keys.length > 1
            _log_error "META and CMD key combos cannot have more than 1 non-modifier keys", combo, non_modifier_keys
            validated = false

    # Tell the user if they are trying to use any
    # combo properties that don't actually exist,
    # but allow the combo
    for property, value of combo
        if _factory_defaults[property] is "undefined"
            _log_error "The property #{property} is not a valid combo property. Your combo has still been registered."

    return validated

_convert_to_shifted_key = (key, e) ->
    return false unless e.shiftKey
    k = _keycode_shifted_keys[key]
    return k if k?
    return false

##########################
# Key Mapping Dictionaries
##########################

_modifier_event_mapping =
    "cmd"   : "metaKey"
    "ctrl"  : "ctrlKey"
    "shift" : "shiftKey"
    "alt"   : "altKey"

_keycode_alternate_names =
    "escape"        : "esc"
    "control"       : "ctrl"
    "command"       : "cmd"
    "break"         : "pause"
    "windows"       : "cmd"
    "option"        : "alt"
    "caps_lock"     : "caps"
    "apostrophe"    : "\'"
    "semicolon"     : ";"
    "tilde"         : "~"
    "accent"        : "`"
    "scroll_lock"   : "scroll"
    "num_lock"      : "num"

_keycode_shifted_keys =
    "/"     : "?"
    "."     : ">"
    ","     : "<"
    "\'"    : "\""
    ";"     : ":"
    "["     : "{"
    "]"     : "}"
    "\\"    : "|"
    "`"     : "~"
    "="     : "+"
    "-"     : "_"
    "1"     : "!"
    "2"     : "@"
    "3"     : "#"
    "4"     : "$"
    "5"     : "%"
    "6"     : "^"
    "7"     : "&"
    "8"     : "*"
    "9"     : "("
    "0"     : ")"

_keycode_dictionary = 
    0   : "\\"          # Firefox reports this keyCode when shift is held
    8   : "backspace"
    9   : "tab"
    12  : "num"
    13  : "enter"
    16  : "shift"
    17  : "ctrl"
    18  : "alt"
    19  : "pause"
    20  : "caps"
    27  : "esc"
    32  : "space"
    33  : "pageup"
    34  : "pagedown"
    35  : "end"
    36  : "home"
    37  : "left"
    38  : "up"
    39  : "right"
    40  : "down"
    44  : "print"
    45  : "insert"
    46  : "delete"
    48  : "0"
    49  : "1"
    50  : "2"
    51  : "3"
    52  : "4"
    53  : "5"
    54  : "6"
    55  : "7"
    56  : "8"
    57  : "9"
    65  : "a"
    66  : "b"
    67  : "c"
    68  : "d"
    69  : "e"
    70  : "f"
    71  : "g"
    72  : "h"
    73  : "i"
    74  : "j"
    75  : "k"
    76  : "l"
    77  : "m"
    78  : "n"
    79  : "o"
    80  : "p"
    81  : "q"
    82  : "r"
    83  : "s"
    84  : "t"
    85  : "u"
    86  : "v"
    87  : "w"
    88  : "x"
    89  : "y"
    90  : "z"
    91  : "cmd"
    92  : "cmd"
    93  : "cmd"
    96  : "num_0"
    97  : "num_1"
    98  : "num_2"
    99  : "num_3"
    100 : "num_4"
    101 : "num_5"
    102 : "num_6"
    103 : "num_7"
    104 : "num_8"
    105 : "num_9"
    106 : "num_multiply"
    107 : "num_add"
    108 : "num_enter"
    109 : "num_subtract"
    110 : "num_decimal"
    111 : "num_divide"
    124 : "print"
    144 : "num"
    145 : "scroll"
    186 : ";"
    187 : "="
    188 : ","
    189 : "-"
    190 : "."
    191 : "/"
    192 : "`"
    219 : "["
    220 : "\\"
    221 : "]"
    222 : "\'"
    223 : "`"
    224 : "cmd"
    225 : "alt"
    # Opera weirdness
    57392   : "ctrl"
    63289   : "num"
    # Firefox weirdness
    59 : ";"

############
# Initialize
############

_decide_meta_key()
_change_keycodes_by_browser()

# Anonymous Module Definition
if typeof define is "function" and define.amd
    define [], ->
        return keypress
else if exports?
    exports.keypress = keypress
else
    window.keypress = keypress
