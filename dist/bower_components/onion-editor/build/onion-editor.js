// wrap-start.frag.js
(function (global, factory) {
  if (typeof define === 'function') {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    global.OnionEditor = factory();
  }
}(this, function () {/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../bower_components/almond/almond", function(){});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/isNative',[], function() {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  return isNative;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/objectTypes',[], function() {

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  return objectTypes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isObject',['../internals/objectTypes'], function(objectTypes) {

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  return isObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimKeys',['./objectTypes'], function(objectTypes) {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = function(object) {
    var index, iterable = object, result = [];
    if (!iterable) return result;
    if (!(objectTypes[typeof object])) return result;
      for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
          result.push(index);
        }
      }
    return result
  };

  return shimKeys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/keys',['../internals/isNative', './isObject', '../internals/shimKeys'], function(isNative, isObject, shimKeys) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    return nativeKeys(object);
  };

  return keys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/defaults',['./keys', '../internals/objectTypes'], function(keys, objectTypes) {

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to `undefined`. Once a
   * property is set, additional defaults of the same property will be ignored.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param- {Object} [guard] Allows working with `_.reduce` without using its
   *  `key` and `object` arguments as sources.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var object = { 'name': 'barney' };
   * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var defaults = function(object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    var args = arguments,
        argsIndex = 0,
        argsLength = typeof guard == 'number' ? 2 : args.length;
    while (++argsIndex < argsLength) {
      iterable = args[argsIndex];
      if (iterable && objectTypes[typeof iterable]) {
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (typeof result[index] == 'undefined') result[index] = iterable[index];
      }
      }
    }
    return result
  };

  return defaults;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArguments',[], function() {

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /**
   * Checks if `value` is an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
   * @example
   *
   * (function() { return _.isArguments(arguments); })(1, 2, 3);
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == argsClass || false;
  }

  return isArguments;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArray',['../internals/isNative'], function(isNative) {

  /** `Object#toString` result shortcuts */
  var arrayClass = '[object Array]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == arrayClass || false;
  };

  return isArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseFlatten',['../objects/isArguments', '../objects/isArray'], function(isArguments, isArray) {

  /**
   * The base implementation of `_.flatten` without support for callback
   * shorthands or `thisArg` binding.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
   * @param {number} [fromIndex=0] The index to start from.
   * @returns {Array} Returns a new flattened array.
   */
  function baseFlatten(array, isShallow, isStrict, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0,
        result = [];

    while (++index < length) {
      var value = array[index];

      if (value && typeof value == 'object' && typeof value.length == 'number'
          && (isArray(value) || isArguments(value))) {
        // recursively flatten arrays (susceptible to call stack limits)
        if (!isShallow) {
          value = baseFlatten(value, isShallow, isStrict);
        }
        var valIndex = -1,
            valLength = value.length,
            resIndex = result.length;

        result.length += valLength;
        while (++valIndex < valLength) {
          result[resIndex++] = value[valIndex];
        }
      } else if (!isStrict) {
        result.push(value);
      }
    }
    return result;
  }

  return baseFlatten;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/noop',[], function() {

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  return noop;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreate',['./isNative', '../objects/isObject', '../utilities/noop'], function(isNative, isObject, noop) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || window.Object();
      };
    }());
  }

  return baseCreate;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/setBindData',['./isNative', '../utilities/noop'], function(isNative, noop) {

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  return setBindData;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/slice',[], function() {

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  return slice;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseBind',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseBind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateWrapper',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseCreateWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isFunction',[], function() {

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  return isFunction;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/createWrapper',['./baseBind', './baseCreateWrapper', '../objects/isFunction', './slice'], function(baseBind, baseCreateWrapper, isFunction, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push,
      unshift = arrayRef.unshift;

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  return createWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/bind',['../internals/createWrapper', '../internals/slice'], function(createWrapper, slice) {

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  return bind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/identity',[], function() {

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  return identity;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/support',['./internals/isNative'], function(isNative) {

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = {};

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  return support;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateCallback',['../functions/bind', '../utilities/identity', './setBindData', '../support'], function(bind, identity, setBindData, support) {

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString;

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  return baseCreateCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forIn',['../internals/baseCreateCallback', '../internals/objectTypes'], function(baseCreateCallback, objectTypes) {

  /**
   * Iterates over own and inherited enumerable properties of an object,
   * executing the callback for each property. The callback is bound to `thisArg`
   * and invoked with three arguments; (value, key, object). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * Shape.prototype.move = function(x, y) {
   *   this.x += x;
   *   this.y += y;
   * };
   *
   * _.forIn(new Shape, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
   */
  var forIn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      for (index in iterable) {
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forIn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/arrayPool',[], function() {

  /** Used to pool arrays and objects used internally */
  var arrayPool = [];

  return arrayPool;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/getArray',['./arrayPool'], function(arrayPool) {

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  return getArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/maxPoolSize',[], function() {

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  return maxPoolSize;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/releaseArray',['./arrayPool', './maxPoolSize'], function(arrayPool, maxPoolSize) {

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  return releaseArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIsEqual',['../objects/forIn', './getArray', '../objects/isFunction', './objectTypes', './releaseArray'], function(forIn, getArray, isFunction, objectTypes, releaseArray) {

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * The base implementation of `_.isEqual`, without support for `thisArg` binding,
   * that allows partial "_.where" style comparisons.
   *
   * @private
   * @param {*} a The value to compare.
   * @param {*} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
   * @param {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    if (callback) {
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        !(a && objectTypes[type]) &&
        !(b && objectTypes[otherType])) {
      return false;
    }
    // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
    // http://es5.github.io/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
          bWrapped = hasOwnProperty.call(b, '__wrapped__');

      if (aWrapped || bWrapped) {
        return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = a.constructor,
          ctorB = b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result || isWhere) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (isWhere) {
            while (index--) {
              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
        }
      });

      if (result && !isWhere) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  return baseIsEqual;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/property',[], function() {

  /**
   * Creates a "_.pluck" style function, which returns the `key` value of a
   * given object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} key The name of the property to retrieve.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var characters = [
   *   { 'name': 'fred',   'age': 40 },
   *   { 'name': 'barney', 'age': 36 }
   * ];
   *
   * var getName = _.property('name');
   *
   * _.map(characters, getName);
   * // => ['barney', 'fred']
   *
   * _.sortBy(characters, getName);
   * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
   */
  function property(key) {
    return function(object) {
      return object[key];
    };
  }

  return property;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/createCallback',['../internals/baseCreateCallback', '../internals/baseIsEqual', '../objects/isObject', '../objects/keys', '../utilities/property'], function(baseCreateCallback, baseIsEqual, isObject, keys, property) {

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name the created callback will return the property value for a given element.
   * If `func` is an object the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(characters, 'age__gt38');
   * // => [{ 'name': 'fred', 'age': 40 }]
   */
  function createCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (func == null || type == 'function') {
      return baseCreateCallback(func, thisArg, argCount);
    }
    // handle "_.pluck" style callback shorthands
    if (type != 'object') {
      return property(func);
    }
    var props = keys(func),
        key = props[0],
        a = func[key];

    // handle "_.where" style callback shorthands
    if (props.length == 1 && a === a && !isObject(a)) {
      // fast path the common case of providing an object with a single
      // property containing a primitive value
      return function(object) {
        var b = object[key];
        return a === b && (a !== 0 || (1 / a == 1 / b));
      };
    }
    return function(object) {
      var length = props.length,
          result = false;

      while (length--) {
        if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
          break;
        }
      }
      return result;
    };
  }

  return createCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forOwn',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forOwn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/map',['../functions/createCallback', '../objects/forOwn'], function(createCallback, forOwn) {

  /**
   * Creates an array of values by running each element in the collection
   * through the callback. The callback is bound to `thisArg` and invoked with
   * three arguments; (value, index|key, collection).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @alias collect
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new array of the results of each `callback` execution.
   * @example
   *
   * _.map([1, 2, 3], function(num) { return num * 3; });
   * // => [3, 6, 9]
   *
   * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
   * // => [3, 6, 9] (property order is not guaranteed across environments)
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.map(characters, 'name');
   * // => ['barney', 'fred']
   */
  function map(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0;

    callback = createCallback(callback, thisArg, 3);
    if (typeof length == 'number') {
      var result = Array(length);
      while (++index < length) {
        result[index] = callback(collection[index], index, collection);
      }
    } else {
      result = [];
      forOwn(collection, function(value, key, collection) {
        result[++index] = callback(value, key, collection);
      });
    }
    return result;
  }

  return map;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/flatten',['../internals/baseFlatten', '../collections/map'], function(baseFlatten, map) {

  /**
   * Flattens a nested array (the nesting can be to any depth). If `isShallow`
   * is truey, the array will only be flattened a single level. If a callback
   * is provided each element of the array is passed through the callback before
   * flattening. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, index, array).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to flatten.
   * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
   * @param {Function|Object|string} [callback=identity] The function called
   *  per iteration. If a property name or object is provided it will be used
   *  to create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array} Returns a new flattened array.
   * @example
   *
   * _.flatten([1, [2], [3, [[4]]]]);
   * // => [1, 2, 3, 4];
   *
   * _.flatten([1, [2], [3, [[4]]]], true);
   * // => [1, 2, 3, [[4]]];
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
   *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.flatten(characters, 'pets');
   * // => ['hoppy', 'baby puss', 'dino']
   */
  function flatten(array, isShallow, callback, thisArg) {
    // juggle arguments
    if (typeof isShallow != 'boolean' && isShallow != null) {
      thisArg = callback;
      callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
      isShallow = false;
    }
    if (callback != null) {
      array = map(array, callback, thisArg);
    }
    return baseFlatten(array, isShallow);
  }

  return flatten;
});

define('plugins/core/commands/indent',[],function () {

  

  return function () {
    return function (scribe) {
      var indentCommand = new scribe.api.Command('indent');

      indentCommand.queryEnabled = function () {
        /**
         * FIXME: Chrome nests ULs inside of ULs
         * Currently we just disable the command when the selection is inside of
         * a list.
         * As per: http://jsbin.com/ORikUPa/3/edit?html,js,output
         */
        var selection = new scribe.api.Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.indent = indentCommand;
    };
  };

});

define('plugins/core/commands/insert-list',[],function () {

  /**
   * If the paragraphs option is set to true, then when the list is
   * unapplied, ensure that we enter a P element.
   */

  

  return function () {
    return function (scribe) {
      var InsertListCommand = function (commandName) {
        scribe.api.Command.call(this, commandName);
      };

      InsertListCommand.prototype = Object.create(scribe.api.Command.prototype);
      InsertListCommand.prototype.constructor = InsertListCommand;

      InsertListCommand.prototype.execute = function (value) {
        function splitList(listItemElements) {
          if (listItemElements.length > 0) {
            var newListNode = document.createElement(listNode.nodeName);

            listItemElements.forEach(function (listItemElement) {
              newListNode.appendChild(listItemElement);
            });

            listNode.parentNode.insertBefore(newListNode, listNode.nextElementSibling);
          }
        }

        if (this.queryState()) {
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var listNode = selection.getContaining(function (node) {
            return node.nodeName === 'OL' || node.nodeName === 'UL';
          });

          var listItemElement = selection.getContaining(function (node) {
            return node.nodeName === 'LI';
          });

          scribe.transactionManager.run(function () {
            if (listItemElement) {
              var nextListItemElements = (new scribe.api.Node(listItemElement)).nextAll();

              /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(nextListItemElements);

              /**
               * Insert a paragraph in place of the list item.
               */

              selection.placeMarkers();

              var pNode = document.createElement('p');
              pNode.innerHTML = listItemElement.innerHTML;

              listNode.parentNode.insertBefore(pNode, listNode.nextElementSibling);
              listItemElement.parentNode.removeChild(listItemElement);
            } else {
              /**
               * When multiple list items are selected, we replace each list
               * item with a paragraph.
               */

              // We can't query for list items in the selection so we loop
              // through them all and find the intersection ourselves.
              var selectedListItemElements = Array.prototype.map.call(listNode.querySelectorAll('li'),
                function (listItemElement) {
                return range.intersectsNode(listItemElement) && listItemElement;
              }).filter(function (listItemElement) {
                // TODO: identity
                return listItemElement;
              });
              var lastSelectedListItemElement = selectedListItemElements.slice(-1)[0];
              var listItemElementsAfterSelection = (new scribe.api.Node(lastSelectedListItemElement)).nextAll();

              /**
               * If we are not at the start or end of a UL/OL, we have to
               * split the node and insert the P(s) in the middle.
               */
              splitList(listItemElementsAfterSelection);

              // Store the caret/range positioning inside of the list items so
              // we can restore it from the newly created P elements soon
              // afterwards.
              selection.placeMarkers();

              var documentFragment = document.createDocumentFragment();
              selectedListItemElements.forEach(function (listItemElement) {
                var pElement = document.createElement('p');
                pElement.innerHTML = listItemElement.innerHTML;
                documentFragment.appendChild(pElement);
              });

              // Insert the Ps
              listNode.parentNode.insertBefore(documentFragment, listNode.nextElementSibling);

              // Remove the LIs
              selectedListItemElements.forEach(function (listItemElement) {
                listItemElement.parentNode.removeChild(listItemElement);
              });
            }

            // If the list is now empty, clean it up.
            if (listNode.childNodes.length === 0) {
              listNode.parentNode.removeChild(listNode);
            }

            selection.selectMarkers();
          }.bind(this));
        } else {
          scribe.api.Command.prototype.execute.call(this, value);
        }
      };

      InsertListCommand.prototype.queryEnabled = function () {
        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements();
      };

      scribe.commands.insertOrderedList = new InsertListCommand('insertOrderedList');
      scribe.commands.insertUnorderedList = new InsertListCommand('insertUnorderedList');
    };
  };

});

define('plugins/core/commands/outdent',[],function () {

  

  return function () {
    return function (scribe) {
      var outdentCommand = new scribe.api.Command('outdent');

      outdentCommand.queryEnabled = function () {
        /**
         * FIXME: If the paragraphs option is set to true, then when the
         * list is unapplied, ensure that we enter a P element.
         * Currently we just disable the command when the selection is inside of
         * a list.
         */
        var selection = new scribe.api.Selection();
        var listElement = selection.getContaining(function (element) {
          return element.nodeName === 'UL' || element.nodeName === 'OL';
        });

        // FIXME: define block element rule here?
        return scribe.api.Command.prototype.queryEnabled.call(this) && scribe.allowsBlockElements() && ! listElement;
      };

      scribe.commands.outdent = outdentCommand;
    };
  };

});

define('plugins/core/commands/redo',[],function () {

  

  return function () {
    return function (scribe) {
      var redoCommand = new scribe.api.Command('redo');

      redoCommand.execute = function () {
        var historyItem = scribe.undoManager.redo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      redoCommand.queryEnabled = function () {
        return scribe.undoManager.position < scribe.undoManager.stack.length - 1;
      };

      scribe.commands.redo = redoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
          event.preventDefault();
          redoCommand.execute();
        }
      });
    };
  };

});

define('plugins/core/commands/subscript',[],function () {

  

  return function () {
    return function (scribe) {
      var subscriptCommand = new scribe.api.Command('subscript');

      scribe.commands.subscript = subscriptCommand;
    };
  };

});

define('plugins/core/commands/superscript',[],function () {

  

  return function () {
    return function (scribe) {
      var superscriptCommand = new scribe.api.Command('superscript');

      scribe.commands.superscript = superscriptCommand;
    };
  };

});

define('plugins/core/commands/undo',[],function () {

  

  return function () {
    return function (scribe) {
      var undoCommand = new scribe.api.Command('undo');

      undoCommand.execute = function () {
        var historyItem = scribe.undoManager.undo();

        if (typeof historyItem !== 'undefined') {
          scribe.restoreFromHistory(historyItem);
        }
      };

      undoCommand.queryEnabled = function () {
        return scribe.undoManager.position > 1;
      };

      scribe.commands.undo = undoCommand;

      scribe.el.addEventListener('keydown', function (event) {
        // TODO: use lib to abstract meta/ctrl keys?
        if (! event.shiftKey && (event.metaKey || event.ctrlKey) && event.keyCode === 90) {
          event.preventDefault();
          undoCommand.execute();
        }
      });
    };
  };

});

define('plugins/core/commands',[
  './commands/indent',
  './commands/insert-list',
  './commands/outdent',
  './commands/redo',
  './commands/subscript',
  './commands/superscript',
  './commands/undo'
], function (
  indent,
  insertList,
  outdent,
  redo,
  subscript,
  superscript,
  undo
) {

  

  return {
    indent: indent,
    insertList: insertList,
    outdent: outdent,
    redo: redo,
    subscript: subscript,
    superscript: superscript,
    undo: undo
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIndexOf',[], function() {

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  return baseIndexOf;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isString',[], function() {

  /** `Object#toString` result shortcuts */
  var stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('fred');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' ||
      value && typeof value == 'object' && toString.call(value) == stringClass || false;
  }

  return isString;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/contains',['../internals/baseIndexOf', '../objects/forOwn', '../objects/isArray', '../objects/isString'], function(baseIndexOf, forOwn, isArray, isString) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeMax = Math.max;

  /**
   * Checks if a given value is present in a collection using strict equality
   * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
   * offset from the end of the collection.
   *
   * @static
   * @memberOf _
   * @alias include
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {*} target The value to check for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
   * @example
   *
   * _.contains([1, 2, 3], 1);
   * // => true
   *
   * _.contains([1, 2, 3], 1, 2);
   * // => false
   *
   * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
   * // => true
   *
   * _.contains('pebbles', 'eb');
   * // => true
   */
  function contains(collection, target, fromIndex) {
    var index = -1,
        indexOf = baseIndexOf,
        length = collection ? collection.length : 0,
        result = false;

    fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
    if (isArray(collection)) {
      result = indexOf(collection, target, fromIndex) > -1;
    } else if (typeof length == 'number') {
      result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
    } else {
      forOwn(collection, function(value) {
        if (++index >= fromIndex) {
          return !(result = value === target);
        }
      });
    }
    return result;
  }

  return contains;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/values',['./keys'], function(keys) {

  /**
   * Creates an array composed of the own enumerable property values of `object`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property values.
   * @example
   *
   * _.values({ 'one': 1, 'two': 2, 'three': 3 });
   * // => [1, 2, 3] (property order is not guaranteed across environments)
   */
  function values(object) {
    var index = -1,
        props = keys(object),
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  return values;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/toArray',['../objects/isString', '../internals/slice', '../objects/values'], function(isString, slice, values) {

  /**
   * Converts the `collection` to an array.
   *
   * @static
   * @memberOf _
   * @category Collections
   * @param {Array|Object|string} collection The collection to convert.
   * @returns {Array} Returns the new converted array.
   * @example
   *
   * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
   * // => [2, 3, 4]
   */
  function toArray(collection) {
    if (collection && typeof collection.length == 'number') {
      return slice(collection);
    }
    return values(collection);
  }

  return toArray;
});

define('scribe-common/src/element',['lodash-amd/modern/collections/contains'], function (contains) {

  

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6'];
  function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
  }

  function isSelectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
      node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    unwrap: unwrap
  };

});

define('scribe-common/src/node',[], function () {

  

  function isEmptyTextNode(node) {
    return (node.nodeType === Node.TEXT_NODE && node.textContent === '');
  }

  function insertAfter(newNode, referenceNode) {
    return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function removeNode(node) {
    return node.parentNode.removeChild(node);
  }

  return {
    isEmptyTextNode: isEmptyTextNode,
    insertAfter: insertAfter,
    removeNode: removeNode
  };

});

define('dom-observer',[
  'lodash-amd/modern/arrays/flatten',
  'lodash-amd/modern/collections/toArray',
  'scribe-common/src/element',
  'scribe-common/src/node'
], function (
  flatten,
  toArray,
  elementHelpers,
  nodeHelpers
) {

  function observeDomChanges(el, callback) {
    function includeRealMutations(mutations) {
      var allChangedNodes = flatten(mutations.map(function(mutation) {
        var added   = toArray(mutation.addedNodes);
        var removed = toArray(mutation.removedNodes);
        return added.concat(removed);
      }));

      var realChangedNodes = allChangedNodes.
        filter(function(n) { return ! nodeHelpers.isEmptyTextNode(n); }).
        filter(function(n) { return ! elementHelpers.isSelectionMarkerNode(n); });

      return realChangedNodes.length > 0;
    }

    // Flag to avoid running recursively
    var runningPostMutation = false;
    var observer = new MutationObserver(function(mutations) {
      if (! runningPostMutation && includeRealMutations(mutations)) {
        runningPostMutation = true;

        try {
          callback();
        } finally {
          // We must yield to let any mutation we caused be triggered
          // in the next cycle
          setTimeout(function() {
            runningPostMutation = false;
          }, 0);
        }
      }
    });

    observer.observe(el, {
      attributes: true,
      childList: true,
      subtree: true
    });

    return observer;
  }

  return observeDomChanges;
});

define('plugins/core/events',[
  'lodash-amd/modern/collections/contains',
  '../../dom-observer'
], function (
  contains,
  observeDomChanges
) {

  

  return function () {
    return function (scribe) {
      /**
       * Push the first history item when the editor is focused.
       */
      var pushHistoryOnFocus = function () {
        // Tabbing into the editor doesn't create a range immediately, so we
        // have to wait until the next event loop.
        setTimeout(function () {
          scribe.pushHistory();
        }.bind(scribe), 0);

        scribe.el.removeEventListener('focus', pushHistoryOnFocus);
      }.bind(scribe);
      scribe.el.addEventListener('focus', pushHistoryOnFocus);

      /**
       * Firefox: Giving focus to a `contenteditable` will place the caret
       * outside of any block elements. Chrome behaves correctly by placing the
       * caret at the  earliest point possible inside the first block element.
       * As per: http://jsbin.com/eLoFOku/1/edit?js,console,output
       *
       * We detect when this occurs and fix it by placing the caret ourselves.
       */
      scribe.el.addEventListener('focus', function placeCaretOnFocus() {
        var selection = new scribe.api.Selection();
        // In Chrome, the range is not created on or before this event loop.
        // It doesn’t matter because this is a fix for Firefox.
        if (selection.range) {

          var isFirefoxBug = scribe.allowsBlockElements() &&
                  selection.range.startContainer === scribe.el;

          if (isFirefoxBug) {
            var focusElement = getFirstDeepestChild(scribe.el.firstChild);

            var range = selection.range;

            range.setStart(focusElement, 0);
            range.setEnd(focusElement, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(range);
          }
        }

        function getFirstDeepestChild(node) {
          var treeWalker = document.createTreeWalker(node);
          var previousNode = treeWalker.currentNode;
          if (treeWalker.firstChild()) {
            // TODO: build list of non-empty elements (used elsewhere)
            // Do not include non-empty elements
            if (treeWalker.currentNode.nodeName === 'BR') {
              return previousNode;
            } else {
              return getFirstDeepestChild(treeWalker.currentNode);
            }
          } else {
            return treeWalker.currentNode;
          }
        }
      }.bind(scribe));

      /**
       * Apply the formatters when there is a DOM mutation.
       */
      var applyFormatters = function() {
        if (!scribe._skipFormatters) {
          var selection = new scribe.api.Selection();
          var isEditorActive = selection.range;

          var runFormatters = function () {
            if (isEditorActive) {
              selection.placeMarkers();
            }
            scribe.setHTML(scribe._htmlFormatterFactory.format(scribe.getHTML()));
            selection.selectMarkers();
          }.bind(scribe);

          // We only want to wrap the formatting in a transaction if the editor is
          // active. If the DOM is mutated when the editor isn't active (e.g.
          // `scribe.setContent`), we do not want to push to the history. (This
          // happens on the first `focus` event).
          if (isEditorActive) {
            // Discard the last history item, as we're going to be adding
            // a new clean history item next.
            scribe.undoManager.undo();

            // Pass content through formatters, place caret back
            scribe.transactionManager.run(runFormatters);
          } else {
            runFormatters();
          }

        }

        delete scribe._skipFormatters;
      }.bind(scribe);

      observeDomChanges(scribe.el, applyFormatters);

      // TODO: disconnect on tear down:
      // observer.disconnect();

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside a heading to ensure a P element is created.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var selection = new scribe.api.Selection();
            var range = selection.range;

            var headingNode = selection.getContaining(function (node) {
              return (/^(H[1-6])$/).test(node.nodeName);
            });

            /**
             * If we are at the end of the heading, insert a P. Otherwise handle
             * natively.
             */
            if (headingNode && range.collapsed) {
              var contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(headingNode, 0);

              // Get the content from the range to the end of the heading
              var contentToEndFragment = contentToEndRange.cloneContents();

              if (contentToEndFragment.firstChild.textContent === '') {
                event.preventDefault();

                scribe.transactionManager.run(function () {
                  // Default P
                  // TODO: Abstract somewhere
                  var pNode = document.createElement('p');
                  var brNode = document.createElement('br');
                  pNode.appendChild(brNode);

                  headingNode.parentNode.insertBefore(pNode, headingNode.nextElementSibling);

                  // Re-apply range
                  range.setStart(pNode, 0);
                  range.setEnd(pNode, 0);

                  selection.selection.removeAllRanges();
                  selection.selection.addRange(range);
                });
              }
            }
          }
        });
      }

      /**
       * If the paragraphs option is set to true, we need to manually handle
       * keyboard navigation inside list item nodes.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13 || event.keyCode === 8) { // enter || backspace

            var selection = new scribe.api.Selection();
            var range = selection.range;

            if (range.collapsed) {
              var containerLIElement = selection.getContaining(function (node) {
                return node.nodeName === 'LI';
              });
              if (containerLIElement && containerLIElement.textContent.trim() === '') {
                /**
                 * LIs
                 */

                event.preventDefault();

                var listNode = selection.getContaining(function (node) {
                  return node.nodeName === 'UL' || node.nodeName === 'OL';
                });

                var command = scribe.getCommand(listNode.nodeName === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');

                command.execute();
              }
            }
          }
        });
      }

      /**
       * We have to hijack the paste event to ensure it uses
       * `scribe.insertHTML`, which executes the Scribe version of the command
       * and also runs the formatters.
       */

      /**
       * TODO: could we implement this as a polyfill for `event.clipboardData` instead?
       * I also don't like how it has the authority to perform `event.preventDefault`.
       */

      function agentIsSafari() {
        var ua = navigator.userAgent;
        return ua.search('Safari') >= 0 && ua.search('Chrome') < 0;
      }

      scribe.el.addEventListener('paste', function handlePaste(event) {
        /**
         * Browsers without the Clipboard API (specifically `ClipboardEvent.clipboardData`)
         * and Safari will execute the second branch here.
         */
        if (event.clipboardData
          && (contains(event.clipboardData.types, 'text/html') || !agentIsSafari())
        ) {
          event.preventDefault();

          if (contains(event.clipboardData.types, 'text/html')) {
            var html = event.clipboardData.getData('text/html');
            html = scribe._htmlFormatterFactory.formatPaste(html);
            scribe.insertHTML(html);
          } else {
            scribe.insertPlainText(event.clipboardData.getData('text/plain'));
          }
        } else {
          /**
           * If the browser doesn't have `ClipboardEvent.clipboardData`, we run through a
           * sequence of events:
           *
           *   - Save the text selection
           *   - Focus another, hidden textarea so we paste there
           *   - Copy the pasted content of said textarea
           *   - Give focus back to the scribe
           *   - Restore the text selection
           *
           * This is required because, without access to the Clipboard API, there is literally
           * no other way to manipulate content on paste.
           * As per: https://github.com/jejacks0n/mercury/issues/23#issuecomment-2308347
           *
           * Firefox <= 21
           * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent.clipboardData
           */

          var selection = new scribe.api.Selection();

          // Store the caret position
          selection.placeMarkers();

          var bin = document.createElement('div');
          document.body.appendChild(bin);
          bin.setAttribute('contenteditable', true);
          bin.focus();

          // Wait for the paste to happen (next loop?)
          setTimeout(function () {
            var data = bin.innerHTML;
            bin.parentNode.removeChild(bin);

            // Restore the caret position
            selection.selectMarkers();
            /**
             * Firefox 19 (and maybe others): even though the applied range
             * exists within the Scribe instance, we need to focus it.
             */
            scribe.el.focus();

            data = scribe._htmlFormatterFactory.formatPaste(data);
            scribe.insertHTML(data);
          }, 1);
        }
      });

    };
  };
});

define('plugins/core/formatters/html/replace-nbsp-chars',[],function () {

  /**
   * Chrome:
   */

  

  return function () {
    return function (scribe) {
      var nbspCharRegExp = /(\s|&nbsp;)+/g;

      // TODO: should we be doing this on paste?
      scribe.registerHTMLFormatter('export', function (html) {
        return html.replace(nbspCharRegExp, ' ');
      });
    };
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/last',['../functions/createCallback', '../internals/slice'], function(createCallback, slice) {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeMax = Math.max;

  /**
   * Gets the last element or last `n` elements of an array. If a callback is
   * provided elements at the end of the array are returned as long as the
   * callback returns truey. The callback is bound to `thisArg` and invoked
   * with three arguments; (value, index, array).
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to query.
   * @param {Function|Object|number|string} [callback] The function called
   *  per element or the number of elements to return. If a property name or
   *  object is provided it will be used to create a "_.pluck" or "_.where"
   *  style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {*} Returns the last element(s) of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   *
   * _.last([1, 2, 3], 2);
   * // => [2, 3]
   *
   * _.last([1, 2, 3], function(num) {
   *   return num > 1;
   * });
   * // => [2, 3]
   *
   * var characters = [
   *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
   *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
   *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
   * ];
   *
   * // using "_.pluck" callback shorthand
   * _.pluck(_.last(characters, 'blocked'), 'name');
   * // => ['fred', 'pebbles']
   *
   * // using "_.where" callback shorthand
   * _.last(characters, { 'employer': 'na' });
   * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
   */
  function last(array, callback, thisArg) {
    var n = 0,
        length = array ? array.length : 0;

    if (typeof callback != 'number' && callback != null) {
      var index = length;
      callback = createCallback(callback, thisArg, 3);
      while (index-- && callback(array[index], index, array)) {
        n++;
      }
    } else {
      n = callback;
      if (n == null || thisArg) {
        return array ? array[length - 1] : undefined;
      }
    }
    return slice(array, nativeMax(0, length - n));
  }

  return last;
});

define('plugins/core/formatters/html/enforce-p-elements',[
  'lodash-amd/modern/arrays/last',
  'scribe-common/src/element'
], function (
  last,
  element
) {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the
   * browser deletes the paragraph element, leaving the caret (and any
   * content) outside of any P.
   *
   * Firefox: Erasing across multiple paragraphs, or outside of a
   * whole paragraph (e.g. by ‘Select All’) will leave content outside
   * of any P.
   *
   * Entering a new line in a pristine state state will insert
   * `<div>`s (in Chrome) or `<br>`s (in Firefox) where previously we
   * had `<p>`'s. This patches the behaviour of delete/backspace so
   * that we do not end up in a pristine state.
   */

  

  /**
   * Wrap consecutive inline elements and text nodes in a P element.
   */
  function wrapChildNodes(parentNode) {
    var groups = Array.prototype.reduce.call(parentNode.childNodes,
                                             function (accumulator, binChildNode) {
      var group = last(accumulator);
      if (! group) {
        startNewGroup();
      } else {
        var isBlockGroup = element.isBlockElement(group[0]);
        if (isBlockGroup === element.isBlockElement(binChildNode)) {
          group.push(binChildNode);
        } else {
          startNewGroup();
        }
      }

      return accumulator;

      function startNewGroup() {
        var newGroup = [binChildNode];
        accumulator.push(newGroup);
      }
    }, []);

    var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
      var isBlockGroup = element.isBlockElement(group[0]);
      return ! isBlockGroup;
    });

    consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
      var pElement = document.createElement('p');
      nodes[0].parentNode.insertBefore(pElement, nodes[0]);
      nodes.forEach(function (node) {
        pElement.appendChild(node);
      });
    });

    parentNode._isWrapped = true;
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
    var node = treeWalker.firstChild();

    // FIXME: does this recurse down?

    while (node) {
      // TODO: At the moment we only support BLOCKQUOTEs. See failing
      // tests.
      if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
        wrapChildNodes(node);
        traverse(parentNode);
        break;
      }
      node = treeWalker.nextSibling();
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        /**
         * Ensure P mode.
         *
         * Wrap any orphan text nodes in a P element.
         */
        // TODO: This should be configurable and also correct markup such as
        // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
        // TODO: This should probably be a part of HTML Janitor, or some other
        // formatter.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        wrapChildNodes(bin);
        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});

define('plugins/core/formatters/html/ensure-selectable-containers',[
    'scribe-common/src/element',
    'lodash-amd/modern/collections/contains'
  ], function (
    element,
    contains
  ) {

  /**
   * Chrome and Firefox: All elements need to contain either text or a `<br>` to
   * remain selectable. (Unless they have a width and height explicitly set with
   * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
   */

  

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
  var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];

  function traverse(parentNode) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    function isEmpty(node) {
      return node.children.length === 0
        || (node.children.length === 1
            && element.isSelectionMarkerNode(node.children[0]));
    }

    while (node) {
      if (!element.isSelectionMarkerNode(node)) {
        // Find any node that contains no child *elements*, or just contains
        // whitespace, and is not self-closing
        if (isEmpty(node) &&
          node.textContent.trim() === '' &&
          !contains(html5VoidElements, node.nodeName)) {
          node.appendChild(document.createElement('br'));
        } else if (node.children.length > 0) {
          traverse(node);
        }
      }
      node = node.nextElementSibling;
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/htmlEscapes',[], function() {

  /**
   * Used to convert characters to HTML entities:
   *
   * Though the `>` character is escaped for symmetry, characters like `>` and `/`
   * don't require escaping in HTML and have no special meaning unless they're part
   * of a tag or an unquoted attribute value.
   * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
   */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  return htmlEscapes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/escapeHtmlChar',['./htmlEscapes'], function(htmlEscapes) {

  /**
   * Used by `escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeHtmlChar(match) {
    return htmlEscapes[match];
  }

  return escapeHtmlChar;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/reUnescapedHtml',['./htmlEscapes', '../objects/keys'], function(htmlEscapes, keys) {

  /** Used to match HTML entities and HTML characters */
  var reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

  return reUnescapedHtml;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/escape',['../internals/escapeHtmlChar', '../objects/keys', '../internals/reUnescapedHtml'], function(escapeHtmlChar, keys, reUnescapedHtml) {

  /**
   * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
   * corresponding HTML entities.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} string The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('Fred, Wilma, & Pebbles');
   * // => 'Fred, Wilma, &amp; Pebbles'
   */
  function escape(string) {
    return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
  }

  return escape;
});

define('plugins/core/formatters/plain-text/escape-html-characters',[
  'lodash-amd/modern/utilities/escape'
], function (
  escape
) {

  

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(escape);
    };
  };

});

define('plugins/core/inline-elements-mode',[],function () {

  

  // TODO: abstract
  function hasContent(rootNode) {
    var treeWalker = document.createTreeWalker(rootNode);

    while (treeWalker.nextNode()) {
      if (treeWalker.currentNode) {
        // If the node is a non-empty element or has content
        if (~['br'].indexOf(treeWalker.currentNode.nodeName.toLowerCase()) || treeWalker.currentNode.length > 0) {
          return true;
        }
      }
    }

    return false;
  }

  return function () {
    return function (scribe) {
      /**
       * Firefox has a `insertBrOnReturn` command, but this is not a part of
       * any standard. One day we might have an `insertLineBreak` command,
       * proposed by this spec:
       * https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-insertlinebreak-command
       * As per: http://jsbin.com/IQUraXA/1/edit?html,js,output
       */
      scribe.el.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { // enter
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var blockNode = selection.getContaining(function (node) {
            return node.nodeName === 'LI' || (/^(H[1-6])$/).test(node.nodeName);
          });

          if (! blockNode) {
            event.preventDefault();

            scribe.transactionManager.run(function () {
              /**
               * Firefox: Delete the bogus BR as we insert another one later.
               * We have to do this because otherwise the browser will believe
               * there is content to the right of the selection.
               */
              if (scribe.el.lastChild.nodeName === 'BR') {
                scribe.el.removeChild(scribe.el.lastChild);
              }

              var brNode = document.createElement('br');

              range.insertNode(brNode);
              // After inserting the BR into the range is no longer collapsed, so
              // we have to collapse it again.
              // TODO: Older versions of Firefox require this argument even though
              // it is supposed to be optional. Proxy/polyfill?
              range.collapse(false);

              /**
               * Chrome: If there is no right-hand side content, inserting a BR
               * will not appear to create a line break.
               * Firefox: If there is no right-hand side content, inserting a BR
               * will appear to create a weird "half-line break".
               *
               * Possible solution: Insert two BRs.
               * ✓ Chrome: Inserting two BRs appears to create a line break.
               * Typing will then delete the bogus BR element.
               * Firefox: Inserting two BRs will create two line breaks.
               *
               * Solution: Only insert two BRs if there is no right-hand
               * side content.
               *
               * If the user types on a line immediately after a BR element,
               * Chrome will replace the BR element with the typed characters,
               * whereas Firefox will not. Thus, to satisfy Firefox we have to
               * insert a bogus BR element on initialization (see below).
               */

              var contentToEndRange = range.cloneRange();
              contentToEndRange.setEndAfter(scribe.el.lastChild, 0);

              // Get the content from the range to the end of the heading
              var contentToEndFragment = contentToEndRange.cloneContents();

              // If there is not already a right hand side content we need to
              // insert a bogus BR element.
              if (! hasContent(contentToEndFragment)) {
                var bogusBrNode = document.createElement('br');
                range.insertNode(bogusBrNode);
              }

              var newRange = range.cloneRange();

              newRange.setStartAfter(brNode, 0);
              newRange.setEndAfter(brNode, 0);

              selection.selection.removeAllRanges();
              selection.selection.addRange(newRange);
            });
          }
        }
      }.bind(this));

      if (scribe.getHTML().trim() === '') {
        // Bogus BR element for Firefox — see explanation above.
        // TODO: also append when consumer sets the content manually.
        // TODO: hide when the user calls `getHTML`?
        scribe.setContent('');
      }
    };
  };
});

define('plugins/core/patches/commands/indent',[],function () {

  /**
   * Prevent Chrome from inserting BLOCKQUOTEs inside of Ps, and also from
   * adding a redundant `style` attribute to the created BLOCKQUOTE.
   */

  

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (scribe) {
      var indentCommand = new scribe.api.CommandPatch('indent');

      indentCommand.execute = function (value) {
        scribe.transactionManager.run(function () {
          /**
           * Chrome: If we apply the indent command on an empty P, the
           * BLOCKQUOTE will be nested inside the P.
           * As per: http://jsbin.com/oDOriyU/3/edit?html,js,output
           */
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var isCaretOnNewLine =
              (range.commonAncestorContainer.nodeName === 'P'
               && range.commonAncestorContainer.innerHTML === '<br>');
          if (isCaretOnNewLine) {
            // FIXME: this text node is left behind. Tidy it up somehow,
            // or don't use it at all.
            var textNode = document.createTextNode(INVISIBLE_CHAR);

            range.insertNode(textNode);

            range.setStart(textNode, 0);
            range.setEnd(textNode, 0);

            selection.selection.removeAllRanges();
            selection.selection.addRange(range);
          }

          scribe.api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: The BLOCKQUOTE created contains a redundant style attribute.
           * As per: http://jsbin.com/AkasOzu/1/edit?html,js,output
           */

          // Renew the selection
          selection = new scribe.api.Selection();
          var blockquoteNode = selection.getContaining(function (node) {
            return node.nodeName === 'BLOCKQUOTE';
          });

          if (blockquoteNode) {
            blockquoteNode.removeAttribute('style');
          }
        }.bind(this));
      };

      scribe.commandPatches.indent = indentCommand;
    };
  };

});

define('plugins/core/patches/commands/insert-html',['scribe-common/src/element'], function (element) {

  

  return function () {
    return function (scribe) {
      var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');

      insertHTMLCommandPatch.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          /**
           * Chrome: If a parent node has a CSS `line-height` when we apply the
           * insertHTML command, Chrome appends a SPAN to plain content with
           * inline styling replicating that `line-height`, and adjusts the
           * `line-height` on inline elements.
           * As per: http://jsbin.com/ilEmudi/4/edit?css,js,output
           *
           * FIXME: what if the user actually wants to use SPANs? This could
           * cause conflicts.
           */

          // TODO: share somehow with similar event patch for P nodes
          sanitize(scribe.el);

          function sanitize(parentNode) {
            var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
            var node = treeWalker.firstChild();
            if (!node) { return; }

            do {
              if (node.nodeName === 'SPAN') {
                element.unwrap(parentNode, node);
              } else {
                /**
                 * If the list item contains inline elements such as
                 * A, B, or I, Chrome will also append an inline style for
                 * `line-height` on those elements, so we remove it here.
                 */
                node.style.lineHeight = null;

                // There probably wasn’t a `style` attribute before, so
                // remove it if it is now empty.
                if (node.getAttribute('style') === '') {
                  node.removeAttribute('style');
                }
              }

              // Sanitize children
              sanitize(node);
            } while ((node = treeWalker.nextSibling()));
          }
        }.bind(this));
      };

      scribe.commandPatches.insertHTML = insertHTMLCommandPatch;
    };
  };

});

define('plugins/core/patches/commands/insert-list',['scribe-common/src/element',
        'scribe-common/src/node'], function (element, nodeHelpers) {

  

  return function () {
    return function (scribe) {
      var InsertListCommandPatch = function (commandName) {
        scribe.api.CommandPatch.call(this, commandName);
      };

      InsertListCommandPatch.prototype = Object.create(scribe.api.CommandPatch.prototype);
      InsertListCommandPatch.prototype.constructor = InsertListCommandPatch;

      InsertListCommandPatch.prototype.execute = function (value) {
        scribe.transactionManager.run(function () {
          scribe.api.CommandPatch.prototype.execute.call(this, value);

          if (this.queryState()) {
            var selection = new scribe.api.Selection();

            var listElement = selection.getContaining(function (node) {
              return node.nodeName === 'OL' || node.nodeName === 'UL';
            });


            /**
             * Firefox: If we apply the insertOrderedList or the insertUnorderedList
             * command on an empty block, a P will be inserted after the OL/UL.
             * As per: http://jsbin.com/cubacoli/3/edit?html,js,output
             */

            if (listElement.nextElementSibling &&
                listElement.nextElementSibling.childNodes.length === 0) {
              nodeHelpers.removeNode(listElement.nextElementSibling);
            }

            /**
             * Chrome: If we apply the insertOrderedList or the insertUnorderedList
             * command on an empty block, the OL/UL will be nested inside the block.
             * As per: http://jsbin.com/eFiRedUc/1/edit?html,js,output
             */

            if (listElement) {
              var listParentNode = listElement.parentNode;
              // If list is within a text block then split that block
              if (listParentNode && /^(H[1-6]|P)$/.test(listParentNode.nodeName)) {
                selection.placeMarkers();
                // Move listElement out of the block
                nodeHelpers.insertAfter(listElement, listParentNode);
                selection.selectMarkers();

                /**
                 * Chrome 27-34: An empty text node is inserted.
                 */
                if (listParentNode.childNodes.length === 2 &&
                    nodeHelpers.isEmptyTextNode(listParentNode.firstChild)) {
                  nodeHelpers.removeNode(listParentNode);
                }

                // Remove the block if it's empty
                if (listParentNode.childNodes.length === 0) {
                  nodeHelpers.removeNode(listParentNode);
                }
              }
            }

            /**
             * Chrome: If a parent node has a CSS `line-height` when we apply the
             * insertOrderedList or the insertUnorderedList command, Chrome appends
             * a SPAN to LIs with inline styling replicating that `line-height`.
             * As per: http://jsbin.com/OtemujAY/7/edit?html,css,js,output
             *
             * FIXME: what if the user actually wants to use SPANs? This could
             * cause conflicts.
             */

            // TODO: share somehow with similar event patch for P nodes
            var listItemElements = Array.prototype.slice.call(listElement.childNodes);
            listItemElements.forEach(function(listItemElement) {
              // We clone the childNodes into an Array so that it's
              // not affected by any manipulation below when we
              // iterate over it
              var listItemElementChildNodes = Array.prototype.slice.call(listItemElement.childNodes);
              listItemElementChildNodes.forEach(function(listElementChildNode) {
                if (listElementChildNode.nodeName === 'SPAN') {
                  // Unwrap any SPAN that has been inserted
                  var spanElement = listElementChildNode;
                  element.unwrap(listItemElement, spanElement);
                } else if (listElementChildNode.nodeType === Node.ELEMENT_NODE) {
                  /**
                   * If the list item contains inline elements such as
                   * A, B, or I, Chrome will also append an inline style for
                   * `line-height` on those elements, so we remove it here.
                   */
                  listElementChildNode.style.lineHeight = null;

                  // There probably wasn’t a `style` attribute before, so
                  // remove it if it is now empty.
                  if (listElementChildNode.getAttribute('style') === '') {
                    listElementChildNode.removeAttribute('style');
                  }
                }
              });
            });
          }
        }.bind(this));
      };

      scribe.commandPatches.insertOrderedList = new InsertListCommandPatch('insertOrderedList');
      scribe.commandPatches.insertUnorderedList = new InsertListCommandPatch('insertUnorderedList');
    };
  };

});

define('plugins/core/patches/commands/outdent',[],function () {

  /**
   * Prevent Chrome from removing formatting of BLOCKQUOTE contents.
   */

  

  return function () {
    return function (scribe) {
      var outdentCommand = new scribe.api.CommandPatch('outdent');

      outdentCommand.execute = function () {
        scribe.transactionManager.run(function () {
          var selection = new scribe.api.Selection();
          var range = selection.range;

          var blockquoteNode = selection.getContaining(function (node) {
            return node.nodeName === 'BLOCKQUOTE';
          });

          if (range.commonAncestorContainer.nodeName === 'BLOCKQUOTE') {
            /**
             * Chrome: Applying the outdent command when a whole BLOCKQUOTE is
             * selected removes the formatting of its contents.
             * As per: http://jsbin.com/okAYaHa/1/edit?html,js,output
             */

            // Insert a copy of the selection before the BLOCKQUOTE, and then
            // restore the selection on the copy.
            selection.placeMarkers();
            // We want to copy the selected nodes *with* the markers
            selection.selectMarkers(true);
            var selectedNodes = range.cloneContents();
            blockquoteNode.parentNode.insertBefore(selectedNodes, blockquoteNode);
            range.deleteContents();
            selection.selectMarkers();

            // Delete the BLOCKQUOTE if it's empty
            if (blockquoteNode.textContent === '') {
              blockquoteNode.parentNode.removeChild(blockquoteNode);
            }
          } else {
            /**
             * Chrome: If we apply the outdent command on a P, the contents of the
             * P will be outdented instead of the whole P element.
             * As per: http://jsbin.com/IfaRaFO/1/edit?html,js,output
             */

            var pNode = selection.getContaining(function (node) {
              return node.nodeName === 'P';
            });

            if (pNode) {
              /**
               * If we are not at the start of end of a BLOCKQUOTE, we have to
               * split the node and insert the P in the middle.
               */

              var nextSiblingNodes = (new scribe.api.Node(pNode)).nextAll();

              if (nextSiblingNodes.length) {
                var newContainerNode = document.createElement(blockquoteNode.nodeName);

                nextSiblingNodes.forEach(function (siblingNode) {
                  newContainerNode.appendChild(siblingNode);
                });

                blockquoteNode.parentNode.insertBefore(newContainerNode, blockquoteNode.nextElementSibling);
              }

              selection.placeMarkers();
              blockquoteNode.parentNode.insertBefore(pNode, blockquoteNode.nextElementSibling);
              selection.selectMarkers();

              // If the BLOCKQUOTE is now empty, clean it up.
              if (blockquoteNode.innerHTML === '') {
                blockquoteNode.parentNode.removeChild(blockquoteNode);
              }
            } else {
              scribe.api.CommandPatch.prototype.execute.call(this);
            }
          }
        }.bind(this));
      };

      scribe.commandPatches.outdent = outdentCommand;
    };
  };

});

define('plugins/core/patches/commands/create-link',[],function () {

  

  return function () {
    return function (scribe) {
      var createLinkCommand = new scribe.api.CommandPatch('createLink');
      scribe.commandPatches.createLink = createLinkCommand;

      createLinkCommand.execute = function (value) {
        var selection = new scribe.api.Selection();

        /**
         * Firefox does not create a link when selection is collapsed
         * so we create it manually. http://jsbin.com/tutufi/2/edit?js,output
         */
        if (selection.selection.isCollapsed) {
          var aElement = document.createElement('a');
          aElement.setAttribute('href', value);
          aElement.textContent = value;

          selection.range.insertNode(aElement);

          // Select the created link
          var newRange = document.createRange();
          newRange.setStartBefore(aElement);
          newRange.setEndAfter(aElement);

          selection.selection.removeAllRanges();
          selection.selection.addRange(newRange);
        } else {
          scribe.api.CommandPatch.prototype.execute.call(this, value);
        }
      };
    };
  };

});

define('plugins/core/patches/events',['scribe-common/src/element'], function (element) {

  

  return function () {
    return function (scribe) {
      /**
       * Chrome: If a parent node has a CSS `line-height` when we apply the
       * insert(Un)OrderedList command, altering the paragraph structure by pressing
       * <backspace> or <delete> (merging/deleting paragraphs) sometimes
       * results in the application of a line-height attribute to the
       * contents of the paragraph, either onto existing elements or
       * by wrapping text in a span.
       * As per: http://jsbin.com/isIdoKA/4/edit?html,css,js,output
       *
       * FIXME: what if the user actually wants to use SPANs? This could
       * cause conflicts.
       */
      // TODO: do we need to run this on every key press, or could we
      //       detect when the issue may have occurred?
      // TODO: run in a transaction so as to record the change? how do
      //       we know in advance whether there will be a change though?
      // TODO: share somehow with `InsertList` command
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keyup', function (event) {
          if (event.keyCode === 8 || event.keyCode === 46) { // backspace or delete

            var selection = new scribe.api.Selection();

            // Note: the range is always collapsed on keyup here
            var containerPElement = selection.getContaining(function (node) {
              return node.nodeName === 'P';
            });
            if (containerPElement) {
              /**
               * The 'input' event listener has already triggered
               * and recorded the faulty content as an item in the
               * UndoManager.  We interfere with the undoManager
               * here to discard that history item, and let the next
               * transaction run produce a clean one instead.
               *
               * FIXME: ideally we would not trigger a
               * 'content-changed' event with faulty HTML at all, but
               * it's too late to cancel it at this stage (and it's
               * not happened yet at keydown time).
               */
              scribe.undoManager.undo();

              scribe.transactionManager.run(function () {
                // Store the caret position
                selection.placeMarkers();

                // We clone the childNodes into an Array so that it's
                // not affected by any manipulation below when we
                // iterate over it
                var pElementChildNodes = Array.prototype.slice.call(containerPElement.childNodes);
                pElementChildNodes.forEach(function(pElementChildNode) {
                  if (pElementChildNode.nodeName === 'SPAN') {
                    // Unwrap any SPAN that has been inserted
                    var spanElement = pElementChildNode;
                    element.unwrap(containerPElement, spanElement);
                  } else if (pElementChildNode.nodeType === Node.ELEMENT_NODE) {
                    /**
                     * If the paragraph contains inline elements such as
                     * A, B, or I, Chrome will also append an inline style for
                     * `line-height` on those elements, so we remove it here.
                     */
                    pElementChildNode.style.lineHeight = null;

                    // There probably wasn’t a `style` attribute before, so
                    // remove it if it is now empty.
                    if (pElementChildNode.getAttribute('style') === '') {
                      pElementChildNode.removeAttribute('style');
                    }
                  }
                });

                selection.selectMarkers();
              });
            }
          }
        });
      }
    };
  };
});

define('plugins/core/patches',[
  './patches/commands/indent',
  './patches/commands/insert-html',
  './patches/commands/insert-list',
  './patches/commands/outdent',
  './patches/commands/create-link',
  './patches/events'
], function (
  indentCommand,
  insertHTMLCommand,
  insertListCommands,
  outdentCommand,
  createLinkCommand,
  events
) {

  /**
   * Command patches browser inconsistencies. They do not perform core features
   * of the editor, such as ensuring P elements are created when
   * applying/unapplying commands — that is the job of the core commands.
   */

  

  return {
    commands: {
      indent: indentCommand,
      insertHTML: insertHTMLCommand,
      insertList: insertListCommands,
      outdent: outdentCommand,
      createLink: createLinkCommand,
    },
    events: events
  };

});

define('plugins/core/set-root-p-element',[],function () {

  /**
   * Sets the default content of the scribe so that each carriage return creates
   * a P.
   */

  

  return function () {
    return function (scribe) {
      // The content might have already been set, in which case we don't want
      // to apply.
      if (scribe.getHTML().trim() === '') {
        /**
         * We have to begin with the following HTML, because otherwise some
         * browsers(?) will position the caret outside of the P when the scribe is
         * focused.
         */
        scribe.setContent('<p><br></p>');
      }
    };
  };

});

define('api/command-patch',[],function () {

  

  return function (scribe) {
    function CommandPatch(commandName) {
      this.commandName = commandName;
    }

    CommandPatch.prototype.execute = function (value) {
      scribe.transactionManager.run(function () {
        document.execCommand(this.commandName, false, value || null);
      }.bind(this));
    };

    CommandPatch.prototype.queryState = function () {
      // Hack for firefox, which does not like this.
      if (this.commandName === 'insertOrderedList' || this.commandName == 'insertUnorderedList') {
        return false;
      }
      return document.queryCommandState(this.commandName);
    };

    CommandPatch.prototype.queryEnabled = function () {
      return document.queryCommandEnabled(this.commandName);
    };

    return CommandPatch;
  };

});

define('api/command',[],function () {

  

  return function (scribe) {
    function Command(commandName) {
      this.commandName = commandName;
      this.patch = scribe.commandPatches[this.commandName];
    }

    Command.prototype.execute = function (value) {
      if (this.patch) {
        this.patch.execute(value);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };

    Command.prototype.queryState = function () {
      if (this.patch) {
        return this.patch.queryState();
      } else {
        return document.queryCommandState(this.commandName);
      }
    };

    Command.prototype.queryEnabled = function () {
      if (this.patch) {
        return this.patch.queryEnabled();
      } else {
        return document.queryCommandEnabled(this.commandName);
      }
    };

    return Command;
  };

});

define('api/node',[],function () {

  

  function Node(node) {
    this.node = node;
  }

  // TODO: should the return value be wrapped in one of our APIs?
  // Node or Selection?
  // TODO: write tests. unit or integration?
  Node.prototype.getAncestor = function (nodeFilter) {
    var isTopContainerElement = function (element) {
      return element && element.attributes
        && element.attributes.getNamedItem('contenteditable');
    };
    // TODO: should this happen here?
    if (isTopContainerElement(this.node)) {
      return;
    }

    var currentNode = this.node.parentNode;

    // If it's a `contenteditable` then it's likely going to be the Scribe
    // instance, so stop traversing there.
    while (currentNode && ! isTopContainerElement(currentNode)) {
      if (nodeFilter(currentNode)) {
        return currentNode;
      }
      currentNode = currentNode.parentNode;
    }
  };

  Node.prototype.nextAll = function () {
    var all = [];
    var el = this.node.nextSibling;
    while (el) {
      all.push(el);
      el = el.nextSibling;
    }
    return all;
  };

  return Node;

});

define('api/selection',[],function () {

  

  return function (scribe) {
    function Selection() {
      this.selection = window.getSelection();

      if (this.selection.rangeCount) {
        this.range = this.selection.getRangeAt(0);
      }
    }

    Selection.prototype.getContaining = function (nodeFilter) {
      if (!this.range) {
        return;
      }
      var node = new scribe.api.Node(this.range.commonAncestorContainer);
      var isTopContainerElement = node.node && node.node.attributes
         && node.node.attributes.getNamedItem('contenteditable');

      return ! isTopContainerElement && nodeFilter(node.node) ? node.node : node.getAncestor(nodeFilter);
    };

    Selection.prototype.placeMarkers = function () {
      if (!this.range) {
        return;
      }
      var startMarker = document.createElement('em');
      startMarker.classList.add('scribe-marker');
      var endMarker = document.createElement('em');
      endMarker.classList.add('scribe-marker');

      // End marker
      var rangeEnd = this.range.cloneRange();
      rangeEnd.collapse(false);
      rangeEnd.insertNode(endMarker);

      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
       * the inserted element. We just remove it. This in turn creates several
       * bugs when perfoming commands on selections that contain an empty text
       * node (`removeFormat`, `unlink`).
       * As per: http://jsbin.com/hajim/5/edit?js,console,output
       */
      // TODO: abstract into polyfill for `Range.insertNode`
      if (endMarker.nextSibling &&
          endMarker.nextSibling.nodeType === Node.TEXT_NODE
          && endMarker.nextSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.nextSibling);
      }



      /**
       * Chrome and Firefox: `Range.insertNode` inserts a bogus text node before
       * the inserted element when the child element is at the start of a block
       * element. We just remove it.
       * FIXME: Document why we need to remove this
       * As per: http://jsbin.com/sifez/1/edit?js,console,output
       */
      if (endMarker.previousSibling &&
          endMarker.previousSibling.nodeType === Node.TEXT_NODE
          && endMarker.previousSibling.data === '') {
        endMarker.parentNode.removeChild(endMarker.previousSibling);
      }


      /**
       * This is meant to test Chrome inserting erroneous text blocks into
       * the scribe el when focus switches from a scribe.el to a button to
       * the scribe.el. However, this is impossible to simlulate correctly
       * in a test.
       *
       * This behaviour does not happen in Firefox.
       *
       * See http://jsbin.com/quhin/2/edit?js,output,console
       *
       * To reproduce the bug, follow the following steps:
       *    1. Select text and create H2
       *    2. Move cursor to front of text.
       *    3. Remove the H2 by clicking the button
       *    4. Observe that you are left with an empty H2
       *        after the element.
       *
       * The problem is caused by the Range being different, depending on
       * the position of the marker.
       *
       * Consider the following two scenarios.
       *
       * A)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click the right of to scribe.el
       *   3. scribe.el contains: ["1", <em>scribe-marker</em>. #text]
       *
       *   This is wrong but does not cause the problem.
       *
       * B)
       *   1. scribe.el contains: ["1", <em>scribe-marker</em>]
       *   2. Click button and click to left of scribe.el
       *   3. scribe.el contains: [#text, <em>scribe-marker</em>, "1"]
       *
       * The second example sets the range in the wrong place, meaning
       * that in the second case the formatBlock is executed on the wrong
       * element [the text node] leaving the empty H2 behind.
       **/


      if (! this.selection.isCollapsed) {
        // Start marker
        var rangeStart = this.range.cloneRange();
        rangeStart.collapse(true);
        rangeStart.insertNode(startMarker);

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node after
         * the inserted element. We just remove it. This in turn creates several
         * bugs when perfoming commands on selections that contain an empty text
         * node (`removeFormat`, `unlink`).
         * As per: http://jsbin.com/hajim/5/edit?js,console,output
         */
        // TODO: abstract into polyfill for `Range.insertNode`
        if (startMarker.nextSibling &&
            startMarker.nextSibling.nodeType === Node.TEXT_NODE
            && startMarker.nextSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.nextSibling);
        }

        /**
         * Chrome and Firefox: `Range.insertNode` inserts a bogus text node
         * before the inserted element when the child element is at the start of
         * a block element. We just remove it.
         * FIXME: Document why we need to remove this
         * As per: http://jsbin.com/sifez/1/edit?js,console,output
         */
        if (startMarker.previousSibling &&
            startMarker.previousSibling.nodeType === Node.TEXT_NODE
            && startMarker.previousSibling.data === '') {
          startMarker.parentNode.removeChild(startMarker.previousSibling);
        }
      }


      this.selection.removeAllRanges();
      this.selection.addRange(this.range);
    };

    Selection.prototype.getMarkers = function () {
      return scribe.el.querySelectorAll('em.scribe-marker');
    };

    Selection.prototype.removeMarkers = function () {
      var markers = this.getMarkers();
      Array.prototype.forEach.call(markers, function (marker) {
        marker.parentNode.removeChild(marker);
      });
    };

    // This will select markers if there are any. You will need to focus the
    // Scribe instance’s element if it is not already for the selection to
    // become active.
    Selection.prototype.selectMarkers = function (keepMarkers) {
      var markers = this.getMarkers();
      if (!markers.length) {
        return;
      }

      var newRange = document.createRange();

      newRange.setStartBefore(markers[0]);
      if (markers.length >= 2) {
        newRange.setEndAfter(markers[1]);
      } else {
        // We always reset the end marker because otherwise it will just
        // use the current range’s end marker.
        newRange.setEndAfter(markers[0]);
      }

      if (! keepMarkers) {
        this.removeMarkers();
      }

      this.selection.removeAllRanges();
      this.selection.addRange(newRange);
    };

    Selection.prototype.isCaretOnNewLine = function () {
      var containerPElement = this.getContaining(function (node) {
        return node.nodeName === 'P';
      });
      // We must do `innerHTML.trim()` to avoid weird Firefox bug:
      // http://stackoverflow.com/questions/3676927/why-if-element-innerhtml-is-not-working-in-firefox
      if (containerPElement) {
        var containerPElementInnerHTML = containerPElement.innerHTML.trim();
        return (containerPElement.nodeName === 'P'
                && (containerPElementInnerHTML === '<br>'
                    || containerPElementInnerHTML === ''));
      } else {
        return false;
      }
    };

    return Selection;
  };

});

define('api/simple-command',[],function () {

  

  return function (api, scribe) {
    function SimpleCommand(commandName, nodeName) {
      scribe.api.Command.call(this, commandName);

      this.nodeName = nodeName;
    }

    SimpleCommand.prototype = Object.create(api.Command.prototype);
    SimpleCommand.prototype.constructor = SimpleCommand;

    SimpleCommand.prototype.queryState = function () {
      var selection = new scribe.api.Selection();
      return scribe.api.Command.prototype.queryState.call(this) && !! selection.getContaining(function (node) {
        return node.nodeName === this.nodeName;
      }.bind(this));
    };

    return SimpleCommand;
  };

});

define('api',[
  './api/command-patch',
  './api/command',
  './api/node',
  './api/selection',
  './api/simple-command'
], function (
  buildCommandPatch,
  buildCommand,
  Node,
  buildSelection,
  buildSimpleCommand
) {

  

  return function Api(scribe) {
    this.CommandPatch = buildCommandPatch(scribe);
    this.Command = buildCommand(scribe);
    this.Node = Node;
    this.Selection = buildSelection(scribe);
    this.SimpleCommand = buildSimpleCommand(this, scribe);
  };
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/assign',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a callback is provided it will be executed to produce the
   * assigned values. The callback is bound to `thisArg` and invoked with two
   * arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
   * // => { 'name': 'fred', 'employer': 'slate' }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var object = { 'name': 'barney' };
   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var assign = function(object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    var args = arguments,
        argsIndex = 0,
        argsLength = typeof guard == 'number' ? 2 : args.length;
    if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
      var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
    } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
      callback = args[--argsLength];
    }
    while (++argsIndex < argsLength) {
      iterable = args[argsIndex];
      if (iterable && objectTypes[typeof iterable]) {
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
      }
      }
    }
    return result
  };

  return assign;
});

define('transaction-manager',['lodash-amd/modern/objects/assign'], function (assign) {

  

  return function (scribe) {
    function TransactionManager() {
      this.history = [];
    }

    assign(TransactionManager.prototype, {
      start: function () {
        this.history.push(1);
      },

      end: function () {
        this.history.pop();

        if (this.history.length === 0) {
          scribe.pushHistory();
          scribe.trigger('content-changed');
        }
      },

      run: function (transaction) {
        this.start();
        // If there is an error, don't prevent the transaction from ending.
        try {
          if (transaction) {
            transaction();
          }
        } finally {
          this.end();
        }
      }
    });

    return TransactionManager;
  };
});

define('undo-manager',[],function () {

  

  return function (scribe) {

    function UndoManager() {
      this.position = -1;
      this.stack = [];
      this.debug = scribe.isDebugModeEnabled();
    }

    UndoManager.prototype.maxStackSize = 100;

    UndoManager.prototype.push = function (item) {
      if (this.debug) {
        console.log('UndoManager.push: %s', item);
      }
      this.stack.length = ++this.position;
      this.stack.push(item);

      while (this.stack.length > this.maxStackSize) {
        this.stack.shift();
        --this.position;
      }
    };

    UndoManager.prototype.undo = function () {
      if (this.position > 0) {
        return this.stack[--this.position];
      }
    };

    UndoManager.prototype.redo = function () {
      if (this.position < (this.stack.length - 1)) {
        return this.stack[++this.position];
      }
    };

    return UndoManager;
  };

});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/arrays/pull',[], function() {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var splice = arrayRef.splice;

  /**
   * Removes all provided values from the given array using strict equality for
   * comparisons, i.e. `===`.
   *
   * @static
   * @memberOf _
   * @category Arrays
   * @param {Array} array The array to modify.
   * @param {...*} [value] The values to remove.
   * @returns {Array} Returns `array`.
   * @example
   *
   * var array = [1, 2, 3, 1, 2, 3];
   * _.pull(array, 2, 3);
   * console.log(array);
   * // => [1, 1]
   */
  function pull(array) {
    var args = arguments,
        argsIndex = 0,
        argsLength = args.length,
        length = array ? array.length : 0;

    while (++argsIndex < argsLength) {
      var index = -1,
          value = args[argsIndex];
      while (++index < length) {
        if (array[index] === value) {
          splice.call(array, index--, 1);
          length--;
        }
      }
    }
    return array;
  }

  return pull;
});

define('event-emitter',['lodash-amd/modern/arrays/pull'], function (pull) {

  

  // TODO: once
  // TODO: unit test
  // Good example of a complete(?) implementation: https://github.com/Wolfy87/EventEmitter
  function EventEmitter() {
    this._listeners = {};
  }

  EventEmitter.prototype.on = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];

    listeners.push(fn);

    this._listeners[eventName] = listeners;
  };

  EventEmitter.prototype.off = function (eventName, fn) {
    var listeners = this._listeners[eventName] || [];
    if (fn) {
      pull(listeners, fn);
    } else {
      delete this._listeners[eventName];
    }
  };

  EventEmitter.prototype.trigger = function (eventName, args) {
    var listeners = this._listeners[eventName] || [];

    listeners.forEach(function (listener) {
      listener.apply(null, args);
    });
  };

  return EventEmitter;

});

define('scribe',[
  'lodash-amd/modern/objects/defaults',
  'lodash-amd/modern/arrays/flatten',
  './plugins/core/commands',
  './plugins/core/events',
  './plugins/core/formatters/html/replace-nbsp-chars',
  './plugins/core/formatters/html/enforce-p-elements',
  './plugins/core/formatters/html/ensure-selectable-containers',
  './plugins/core/formatters/plain-text/escape-html-characters',
  './plugins/core/inline-elements-mode',
  './plugins/core/patches',
  './plugins/core/set-root-p-element',
  './api',
  './transaction-manager',
  './undo-manager',
  './event-emitter'
], function (
  defaults,
  flatten,
  commands,
  events,
  replaceNbspCharsFormatter,
  enforcePElements,
  ensureSelectableContainers,
  escapeHtmlCharactersFormatter,
  inlineElementsMode,
  patches,
  setRootPElement,
  Api,
  buildTransactionManager,
  buildUndoManager,
  EventEmitter
) {

  

  function Scribe(el, options) {
    EventEmitter.call(this);

    this.el = el;
    this.commands = {};
    this.options = defaults(options || {}, {
      allowBlockElements: true,
      debug: false
    });
    this.commandPatches = {};
    this._plainTextFormatterFactory = new FormatterFactory();
    this._htmlFormatterFactory = new HTMLFormatterFactory();

    this.api = new Api(this);

    var TransactionManager = buildTransactionManager(this);
    this.transactionManager = new TransactionManager();

    var UndoManager = buildUndoManager(this);
    this.undoManager = new UndoManager();

    this.el.setAttribute('contenteditable', true);

    this.el.addEventListener('input', function () {
      /**
       * This event triggers when either the user types something or a native
       * command is executed which causes the content to change (i.e.
       * `document.execCommand('bold')`). We can't wrap a transaction around
       * these actions, so instead we run the transaction in this event.
       */
      this.transactionManager.run();
    }.bind(this), false);

    /**
     * Core Plugins
     */

    if (this.allowsBlockElements()) {
      // Commands assume block elements are allowed, so all we have to do is
      // set the content.
      // TODO: replace this by initial formatter application?
      this.use(setRootPElement());
      // Warning: enforcePElements must come before ensureSelectableContainers
      this.use(enforcePElements());
      this.use(ensureSelectableContainers());
    } else {
      // Commands assume block elements are allowed, so we have to set the
      // content and override some UX.
      this.use(inlineElementsMode());
    }

    // Formatters
    this.use(escapeHtmlCharactersFormatter());
    this.use(replaceNbspCharsFormatter());


    // Patches
    this.use(patches.commands.indent());
    this.use(patches.commands.insertHTML());
    this.use(patches.commands.insertList());
    this.use(patches.commands.outdent());
    this.use(patches.commands.createLink());
    this.use(patches.events());

    this.use(commands.indent());
    this.use(commands.insertList());
    this.use(commands.outdent());
    this.use(commands.redo());
    this.use(commands.subscript());
    this.use(commands.superscript());
    this.use(commands.undo());

    this.use(events());
  }

  Scribe.prototype = Object.create(EventEmitter.prototype);

  // For plugins
  // TODO: tap combinator?
  Scribe.prototype.use = function (configurePlugin) {
    configurePlugin(this);
    return this;
  };

  Scribe.prototype.setHTML = function (html, skipFormatters) {
    if (skipFormatters) {
      this._skipFormatters = true;
    }
    this.el.innerHTML = html;
  };

  Scribe.prototype.getHTML = function () {
    return this.el.innerHTML;
  };

  Scribe.prototype.getContent = function () {
    // Remove bogus BR element for Firefox — see explanation in BR mode files.
    return this._htmlFormatterFactory.formatForExport(this.getHTML().replace(/<br>$/, ''));
  };

  Scribe.prototype.getTextContent = function () {
    return this.el.textContent;
  };

  Scribe.prototype.pushHistory = function () {
    var previousUndoItem = this.undoManager.stack[this.undoManager.position];
    var previousContent = previousUndoItem && previousUndoItem
      .replace(/<em class="scribe-marker">/g, '').replace(/<\/em>/g, '');

    /**
     * Chrome and Firefox: If we did push to the history, this would break
     * browser magic around `Document.queryCommandState` (http://jsbin.com/eDOxacI/1/edit?js,console,output).
     * This happens when doing any DOM manipulation.
     */

    // We only want to push the history if the content actually changed.
    if (! previousUndoItem || (previousUndoItem && this.getContent() !== previousContent)) {
      var selection = new this.api.Selection();

      selection.placeMarkers();
      var html = this.getHTML();
      selection.removeMarkers();

      this.undoManager.push(html);

      return true;
    } else {
      return false;
    }
  };

  Scribe.prototype.getCommand = function (commandName) {
    return this.commands[commandName] || this.commandPatches[commandName] || new this.api.Command(commandName);
  };

  Scribe.prototype.restoreFromHistory = function (historyItem) {
    this.setHTML(historyItem, true);

    // Restore the selection
    var selection = new this.api.Selection();
    selection.selectMarkers();

    // Because we skip the formatters, a transaction is not run, so we have to
    // emit this event ourselves.
    this.trigger('content-changed');
  };

  // This will most likely be moved to another object eventually
  Scribe.prototype.allowsBlockElements = function () {
    return this.options.allowBlockElements;
  };

  Scribe.prototype.setContent = function (content) {
    if (! this.allowsBlockElements()) {
      // Set bogus BR element for Firefox — see explanation in BR mode files.
      content = content + '<br>';
    }

    this.setHTML(content);

    this.trigger('content-changed');
  };

  Scribe.prototype.insertPlainText = function (plainText) {
    this.insertHTML('<p>' + this._plainTextFormatterFactory.format(plainText) + '</p>');
  };

  Scribe.prototype.insertHTML = function (html) {
    /**
     * When pasting text from Google Docs in both Chrome and Firefox,
     * the resulting text will be wrapped in a B tag. So it would look
     * something like <b><p>Text</p></b>, which is invalid HTML. The command
     * insertHTML will then attempt to fix this content by moving the B tag
     * inside the P. The result is: <p><b></b></p><p>Text</p>, which is valid
     * but means an extra P is inserted into the text. To avoid this we run the
     * formatters before the insertHTML command as the formatter will
     * unwrap the P and delete the B tag. It is acceptable to remove invalid
     * HTML as Scribe should only accept valid HTML.
     *
     * See http://jsbin.com/cayosada/3/edit for more
     **/

    // TODO: error if the selection is not within the Scribe instance? Or
    // focus the Scribe instance if it is not already focused?
    this.getCommand('insertHTML').execute(this._htmlFormatterFactory.format(html));
  };

  Scribe.prototype.isDebugModeEnabled = function () {
    return this.options.debug;
  };

  Scribe.prototype.registerHTMLFormatter = function (phase, fn) {
    this._htmlFormatterFactory.formatters[phase].push(fn);
  };

  Scribe.prototype.registerPlainTextFormatter = function (fn) {
    this._plainTextFormatterFactory.formatters.push(fn);
  };

  // TODO: abstract
  function FormatterFactory() {
    this.formatters = [];
  }

  FormatterFactory.prototype.format = function (html) {
    // Map the object to an array: Array[Formatter]
    var formatted = this.formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  function HTMLFormatterFactory() {
    // Object[String,Array[Formatter]]
    // Define phases
    // For a list of formatters, see https://github.com/guardian/scribe/issues/126
    this.formatters = {
      // Configurable sanitization of the HTML, e.g. converting/filter/removing
      // elements
      sanitize: [],
      // Normalize content to ensure it is ready for interaction
      normalize: [],
      paste: [],
      export: []
    };
  }

  HTMLFormatterFactory.prototype = Object.create(FormatterFactory.prototype);
  HTMLFormatterFactory.prototype.constructor = HTMLFormatterFactory;

  HTMLFormatterFactory.prototype.format = function (html) {
    // Flatten the phases
    // Map the object to an array: Array[Formatter]
    var formatters = flatten([this.formatters.sanitize, this.formatters.normalize]);
    var formatted = formatters.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);

    return formatted;
  };

  HTMLFormatterFactory.prototype.formatPaste = function (html) {
    return this.formatters.paste.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  HTMLFormatterFactory.prototype.formatForExport = function (html) {
    return this.formatters.export.reduce(function (formattedData, formatter) {
      return formatter(formattedData);
    }, html);
  };

  return Scribe;

});

//# sourceMappingURL=scribe.js.map;
define('scribe-plugin-blockquote-command',[],function () {

  /**
   * Adds a command for using BLOCKQUOTEs.
   */

  

  return function () {
    return function (scribe) {
      var blockquoteCommand = new scribe.api.SimpleCommand('blockquote', 'BLOCKQUOTE');

      blockquoteCommand.execute = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        command.execute();
      };

      blockquoteCommand.queryEnabled = function () {
        var command = scribe.getCommand(this.queryState() ? 'outdent' : 'indent');
        return command.queryEnabled();
      };

      blockquoteCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        var blockquoteElement = selection.getContaining(function (element) {
          return element.nodeName === 'BLOCKQUOTE';
        });

        return scribe.allowsBlockElements() && !! blockquoteElement;
      };

      scribe.commands.blockquote = blockquoteCommand;

      /**
       * If the paragraphs option is set to true, we unapply the blockquote on
       * <enter> keypresses if the caret is on a new line.
       */
      if (scribe.allowsBlockElements()) {
        scribe.el.addEventListener('keydown', function (event) {
          if (event.keyCode === 13) { // enter

            var command = scribe.getCommand('blockquote');
            if (command.queryState()) {
              var selection = new scribe.api.Selection();
              if (selection.isCaretOnNewLine()) {
                event.preventDefault();
                command.execute();
              }
            }
          }
        });
      }
    };
  };

});

//# sourceMappingURL=scribe-plugin-blockquote-command.js.map;
define('scribe-plugin-curly-quotes',[],function () {

  

  return function () {

    var keys = {
      34: '"',
      39: '\''
    };

    var openDoubleCurly = '“';
    var closeDoubleCurly = '”';

    var openSingleCurly = '‘';
    var closeSingleCurly = '’';

    var NON_BREAKING_SPACE = '\u00A0';

    return function (scribe) {
      // Substitute quotes while typing
      scribe.el.addEventListener('keypress', input);

      // Substitute quotes on setting content or paste
      scribe.registerHTMLFormatter('normalize', substituteCurlyQuotes);

      function input(event) {
        var curlyChar;

        // If previous char is real content, close quote; else, open
        // TODO: annoying Chrome/Firefox
        var currentChar = keys[event.charCode];
        if (currentChar === '"') {
          if (wordBeforeSelectedRange()) {
            curlyChar = closeDoubleCurly;
          } else {
            curlyChar = openDoubleCurly;
          }
        } else if (currentChar === '\'') {
          if (wordBeforeSelectedRange()) {
            curlyChar = closeSingleCurly;
          } else {
            curlyChar = openSingleCurly;
          }
        }

        // Substitute entered char with curly replacement
        if (curlyChar) {
          event.preventDefault();

          scribe.transactionManager.run(function() {
            var quoteText = replaceSelectedRangeWith(curlyChar);
            placeCaretAfter(quoteText);
          });
        }
      }

      function wordBeforeSelectedRange() {
        var prevChar = charBeforeSelectedRange() || '';
        return isWordCharacter(prevChar);
      }

      function charBeforeSelectedRange() {
        var selection = new scribe.api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.startOffset - 1];
      }

      function charAfterSelectedRange() {
        var selection = new scribe.api.Selection();
        var context = selection.range.commonAncestorContainer.textContent;
        return context[selection.range.endOffset];
      }

      function isWordCharacter(character) {
          return /[^\s()]/.test(character);
      }

      /** Delete any selected text, insert text instead */
      function replaceSelectedRangeWith(text) {
        var textNode = document.createTextNode(text);

        var selection = new scribe.api.Selection();
        selection.range.deleteContents();
        selection.range.insertNode(textNode);

        return textNode;
      }

      function placeCaretAfter(node) {
        var rangeAfter = document.createRange();
        rangeAfter.setStartAfter(node);
        rangeAfter.setEndAfter(node);

        var selection = new scribe.api.Selection();
        selection.selection.removeAllRanges();
        selection.selection.addRange(rangeAfter);
      }

      function substituteCurlyQuotes(html) {
        // We don't want to replace quotes within the HTML markup
        // (e.g. attributes), only to text nodes
        var holder = document.createElement('div');
        holder.innerHTML = html;

        // Replace straight single and double quotes with curly
        // equivalent in the given string
        mapTextNodes(holder, function(str) {
          // Tokenise HTML elements vs text between them
          // Note: this is escaped HTML in the text node!
          var tokens = str.split(/(<[^>]+?>)/);
          return tokens.map(function(token) {
            // Only replace quotes in text between (potential) HTML elements
            if (token[0] === '<') {
              return token;
            } else {
              return token.
                // Use [\s\S] instead of . to match any characters _including newlines_
                replace(/([\s\S])?'([\s\S])?/g,
                        replaceQuotesFromContext(openSingleCurly, closeSingleCurly)).
                replace(/([\s\S])?"([\s\S])?/g,
                        replaceQuotesFromContext(openDoubleCurly, closeDoubleCurly));
            }
          }).join('');
        });

        return holder.innerHTML;
      }

      function replaceQuotesFromContext(openCurly, closeCurly) {
        return function(m, prev, next) {
          prev = prev || '';
          next = next || '';
          var isStart = ! prev;
          var isEnd = ! next;
          var hasCharsBefore = isWordCharacter(prev);
          var hasCharsAfter  = isWordCharacter(next);
          // Optimistic heuristic, would need to look at DOM structure
          // (esp block vs inline elements) for more robust inference
          if (hasCharsBefore || (isStart && ! hasCharsAfter && ! isEnd)) {
            return prev + closeCurly + next;
          } else {
            return prev + openCurly + next;
          }
        };
      }

      // Apply a function on all text nodes in a container, mutating in place
      function mapTextNodes(container, func) {
        var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        var node = walker.firstChild();
        if (node) {
          do {
            node.data = func(node.data);
          } while ((node = walker.nextSibling()));
        }

        return node;
      }

    };
  };

});

//# sourceMappingURL=scribe-plugin-curly-quotes.js.map;
define('scribe-plugin-formatter-plain-text-convert-new-lines-to-html',[],function () {

  

  return function () {
    return function (scribe) {
      scribe.registerPlainTextFormatter(function (html) {
        return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
      });
    };
  };

});

//# sourceMappingURL=scribe-plugin-formatter-plain-text-convert-new-lines-to-html.js.map;
define('scribe-plugin-heading-command',[],function () {

  /**
   * This plugin adds a command for headings.
   */

  

  return function (level) {
    return function (scribe) {
      var tag = '<h' + level + '>';
      var nodeName = 'H' + level;
      var commandName = 'h' + level;

      /**
       * Chrome: the `heading` command doesn't work. Supported by Firefox only.
       */

      var headingCommand = new scribe.api.Command('formatBlock');

      headingCommand.execute = function () {
        if (this.queryState()) {
          scribe.api.Command.prototype.execute.call(this, '<p>');
        } else {
          scribe.api.Command.prototype.execute.call(this, tag);
        }
      };

      headingCommand.queryState = function () {
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === nodeName;
        });
      };

      /**
       * All: Executing a heading command inside a list element corrupts the markup.
       * Disabling for now.
       */
      headingCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        var listNode = selection.getContaining(function (node) {
          return node.nodeName === 'OL' || node.nodeName === 'UL';
        });

        return scribe.api.Command.prototype.queryEnabled.apply(this, arguments)
          && scribe.allowsBlockElements() && ! listNode;
      };

      scribe.commands[commandName] = headingCommand;
    };
  };

});

//# sourceMappingURL=scribe-plugin-heading-command.js.map;
define('scribe-plugin-intelligent-unlink-command',[],function () {

  /**
   * This plugin modifies the `unlink` command so that, when the user's
   * selection is collapsed, remove the containing A.
   */

  

  return function () {
    return function (scribe) {
      var unlinkCommand = new scribe.api.Command('unlink');

      unlinkCommand.execute = function () {
        var selection = new scribe.api.Selection();

        if (selection.selection.isCollapsed) {
          scribe.transactionManager.run(function () {
            /**
             * If the selection is collapsed, we can remove the containing anchor.
             */

            var aNode = selection.getContaining(function (node) {
              return node.nodeName === 'A';
            });

            if (aNode) {
              new scribe.api.Element(aNode.parentNode).unwrap(aNode);
            }
          }.bind(this));
        } else {
          scribe.api.Command.prototype.execute.apply(this, arguments);
        }
      };

      unlinkCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        if (selection.selection.isCollapsed) {
          return !! selection.getContaining(function (node) {
            return node.nodeName === 'A';
          });
        } else {
          return scribe.api.Command.prototype.queryEnabled.apply(this, arguments);
        }
      };

      scribe.commands.unlink = unlinkCommand;
    };
  };

});

//# sourceMappingURL=scribe-plugin-intelligent-unlink-command.js.map;
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/isNative',[], function() {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  return isNative;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/objectTypes',[], function() {

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  return objectTypes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isObject',['../internals/objectTypes'], function(objectTypes) {

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  return isObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/noop',[], function() {

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  return noop;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreate',['./isNative', '../objects/isObject', '../utilities/noop'], function(isNative, isObject, noop) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || window.Object();
      };
    }());
  }

  return baseCreate;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/setBindData',['./isNative', '../utilities/noop'], function(isNative, noop) {

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  return setBindData;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/slice',[], function() {

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  return slice;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseBind',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseBind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateWrapper',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseCreateWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isFunction',[], function() {

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  return isFunction;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/createWrapper',['./baseBind', './baseCreateWrapper', '../objects/isFunction', './slice'], function(baseBind, baseCreateWrapper, isFunction, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push,
      unshift = arrayRef.unshift;

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  return createWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/bind',['../internals/createWrapper', '../internals/slice'], function(createWrapper, slice) {

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  return bind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/identity',[], function() {

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  return identity;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/support',['./internals/isNative'], function(isNative) {

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = {};

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  return support;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateCallback',['../functions/bind', '../utilities/identity', './setBindData', '../support'], function(bind, identity, setBindData, support) {

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString;

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  return baseCreateCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forIn',['../internals/baseCreateCallback', '../internals/objectTypes'], function(baseCreateCallback, objectTypes) {

  /**
   * Iterates over own and inherited enumerable properties of an object,
   * executing the callback for each property. The callback is bound to `thisArg`
   * and invoked with three arguments; (value, key, object). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * Shape.prototype.move = function(x, y) {
   *   this.x += x;
   *   this.y += y;
   * };
   *
   * _.forIn(new Shape, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
   */
  var forIn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      for (index in iterable) {
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forIn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/arrayPool',[], function() {

  /** Used to pool arrays and objects used internally */
  var arrayPool = [];

  return arrayPool;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/getArray',['./arrayPool'], function(arrayPool) {

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  return getArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/maxPoolSize',[], function() {

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  return maxPoolSize;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/releaseArray',['./arrayPool', './maxPoolSize'], function(arrayPool, maxPoolSize) {

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  return releaseArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIsEqual',['../objects/forIn', './getArray', '../objects/isFunction', './objectTypes', './releaseArray'], function(forIn, getArray, isFunction, objectTypes, releaseArray) {

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * The base implementation of `_.isEqual`, without support for `thisArg` binding,
   * that allows partial "_.where" style comparisons.
   *
   * @private
   * @param {*} a The value to compare.
   * @param {*} b The other value to compare.
   * @param {Function} [callback] The function to customize comparing values.
   * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
   * @param {Array} [stackA=[]] Tracks traversed `a` objects.
   * @param {Array} [stackB=[]] Tracks traversed `b` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
    // used to indicate that when comparing objects, `a` has at least the properties of `b`
    if (callback) {
      var result = callback(a, b);
      if (typeof result != 'undefined') {
        return !!result;
      }
    }
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }
    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a &&
        !(a && objectTypes[type]) &&
        !(b && objectTypes[otherType])) {
      return false;
    }
    // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
    // http://es5.github.io/#x15.3.4.4
    if (a == null || b == null) {
      return a === b;
    }
    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a)
          ? b != +b
          // but treat `+0` vs. `-0` as not equal
          : (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {
      // unwrap any `lodash` wrapped values
      var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
          bWrapped = hasOwnProperty.call(b, '__wrapped__');

      if (aWrapped || bWrapped) {
        return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
      }
      // exit for functions and DOM nodes
      if (className != objectClass) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = a.constructor,
          ctorB = b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = getArray());
    stackB || (stackB = getArray());

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result || isWhere) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (isWhere) {
            while (index--) {
              if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                break;
              }
            }
          } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      forIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
        }
      });

      if (result && !isWhere) {
        // ensure both objects have the same number of properties
        forIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  return baseIsEqual;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimKeys',['./objectTypes'], function(objectTypes) {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = function(object) {
    var index, iterable = object, result = [];
    if (!iterable) return result;
    if (!(objectTypes[typeof object])) return result;
      for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
          result.push(index);
        }
      }
    return result
  };

  return shimKeys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/keys',['../internals/isNative', './isObject', '../internals/shimKeys'], function(isNative, isObject, shimKeys) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    return nativeKeys(object);
  };

  return keys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/property',[], function() {

  /**
   * Creates a "_.pluck" style function, which returns the `key` value of a
   * given object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {string} key The name of the property to retrieve.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var characters = [
   *   { 'name': 'fred',   'age': 40 },
   *   { 'name': 'barney', 'age': 36 }
   * ];
   *
   * var getName = _.property('name');
   *
   * _.map(characters, getName);
   * // => ['barney', 'fred']
   *
   * _.sortBy(characters, getName);
   * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
   */
  function property(key) {
    return function(object) {
      return object[key];
    };
  }

  return property;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/createCallback',['../internals/baseCreateCallback', '../internals/baseIsEqual', '../objects/isObject', '../objects/keys', '../utilities/property'], function(baseCreateCallback, baseIsEqual, isObject, keys, property) {

  /**
   * Produces a callback bound to an optional `thisArg`. If `func` is a property
   * name the created callback will return the property value for a given element.
   * If `func` is an object the created callback will return `true` for elements
   * that contain the equivalent object properties, otherwise it will return `false`.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
   *   return !match ? func(callback, thisArg) : function(object) {
   *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(characters, 'age__gt38');
   * // => [{ 'name': 'fred', 'age': 40 }]
   */
  function createCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (func == null || type == 'function') {
      return baseCreateCallback(func, thisArg, argCount);
    }
    // handle "_.pluck" style callback shorthands
    if (type != 'object') {
      return property(func);
    }
    var props = keys(func),
        key = props[0],
        a = func[key];

    // handle "_.where" style callback shorthands
    if (props.length == 1 && a === a && !isObject(a)) {
      // fast path the common case of providing an object with a single
      // property containing a primitive value
      return function(object) {
        var b = object[key];
        return a === b && (a !== 0 || (1 / a == 1 / b));
      };
    }
    return function(object) {
      var length = props.length,
          result = false;

      while (length--) {
        if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
          break;
        }
      }
      return result;
    };
  }

  return createCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forOwn',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forOwn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/findKey',['../functions/createCallback', './forOwn'], function(createCallback, forOwn) {

  /**
   * This method is like `_.findIndex` except that it returns the key of the
   * first element that passes the callback check, instead of the element itself.
   *
   * If a property name is provided for `callback` the created "_.pluck" style
   * callback will return the property value of the given element.
   *
   * If an object is provided for `callback` the created "_.where" style callback
   * will return `true` for elements that have the properties of the given object,
   * else `false`.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to search.
   * @param {Function|Object|string} [callback=identity] The function called per
   *  iteration. If a property name or object is provided it will be used to
   *  create a "_.pluck" or "_.where" style callback, respectively.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {string|undefined} Returns the key of the found element, else `undefined`.
   * @example
   *
   * var characters = {
   *   'barney': {  'age': 36, 'blocked': false },
   *   'fred': {    'age': 40, 'blocked': true },
   *   'pebbles': { 'age': 1,  'blocked': false }
   * };
   *
   * _.findKey(characters, function(chr) {
   *   return chr.age < 40;
   * });
   * // => 'barney' (property order is not guaranteed across environments)
   *
   * // using "_.where" callback shorthand
   * _.findKey(characters, { 'age': 1 });
   * // => 'pebbles'
   *
   * // using "_.pluck" callback shorthand
   * _.findKey(characters, 'blocked');
   * // => 'fred'
   */
  function findKey(object, callback, thisArg) {
    var result;
    callback = createCallback(callback, thisArg, 3);
    forOwn(object, function(value, key, object) {
      if (callback(value, key, object)) {
        result = key;
        return false;
      }
    });
    return result;
  }

  return findKey;
});

define('scribe-plugin-keyboard-shortcuts',[
  'lodash-amd/modern/objects/findKey'
], function (
  findKey
) {

  

  return function (commandsToKeyboardShortcutsMap) {
    return function (scribe) {
      scribe.el.addEventListener('keydown', function (event) {
        var commandName = findKey(commandsToKeyboardShortcutsMap, function (isKeyboardShortcut) {
          return isKeyboardShortcut(event);
        });

        if (commandName) {
          // FIXME: should command return undefined if one is
          // not found.

          var command = scribe.getCommand(commandName);
          event.preventDefault();

          if (command.queryEnabled()) {
            command.execute();
          }
        }
      });
    };
  };

});

//# sourceMappingURL=scribe-plugin-keyboard-shortcuts.js.map;
/* A friendly UI for adding links. */

define('scribe-plugin-link-ui',[],function () {

  /**
   * This plugin adds a command for creating links, including a basic prompt.
   */
  return function (config) {
    return function (scribe) {

      var editorEl = scribe.el.parentNode,
          linkPromptCommand = new scribe.api.Command('createLink');
      var $linkTools = $('.link-tools', editorEl),
          $input = $('.link-tools input', editorEl),
          placeHolder = '#replaceme';
      var $results = $('.search-results', $linkTools);

      // this provides a way to externally udpate the results element. 
      var searchHandler = config.searchHandler || function(term, resultsElement) { };

      linkPromptCommand.nodeName = 'A';

      linkPromptCommand.execute = function () {
        var cmd = this,
          selection = new scribe.api.Selection();
        if (!selection.range.collapsed) {
          scribe._skipFormatters = true; // This is a little fucked... 
          scribe.api.SimpleCommand.prototype.execute.call(cmd, placeHolder);  
          showInput($('a[href*=' + placeHolder + ']')); 
        }
      };

      $('.remove', $linkTools).click(function() {
        $input.val('');
        confirmInput();
      });

      $('.ok', $linkTools).click(confirmInput);

      $results.click(function(e) {
        var linkElement = $(e.target).closest('a');
        if (linkElement.length === 1) {
          e.preventDefault();
          $input.val(linkElement.attr("href"));
          updateResults();
        }
      });


      $input
        .bind('keyup', updateResults)
        .bind('keydown', function(e) {
          if (e.keyCode === 13 || e.keyCode === 27) {
            confirmInput();
          }
        });

      scribe.el.addEventListener('click', function(e) {
        // is there a link
        var selection = new scribe.api.Selection();
        var linkElement = $(e.target).closest('a');
        if (linkElement.length === 1) {
          showInput(linkElement);
          e.preventDefault();
        }
      })


      var searchTimeout;
      function updateResults() {
        var v = $input.val();
        if (isSearchTerm(v)) {
          clearTimeout(searchTimeout);
          searchTimeout = setTimeout(searchHandler, 200, v, $results);
          $results.show();
        }
        else {
          $results.hide();
        }
      }

      // cheap way to see if we're searching for something, or entering a url
      function isSearchTerm(s) {
        if (s.indexOf(".") > -1 || s.indexOf("/") > -1 ||
          s.indexOf("www") > -1 || s.indexOf("http://") > -1 ||
          s.indexOf("https://") > -1 || s === "") {
          return false;
        }
        else {
          return true;
        }
      }

      function showInput(linkElement) {
        updateResults();
        $linkTools.show();
        linkElement.addClass('link-edit');
        setTimeout(function() {
          $("body, .link-tools .close").bind('click', closeByClick);
          $input.val(linkElement.attr('href').replace(placeHolder, ""))
          $input[0].focus();
        }, 10)
      }

      function closeByClick(e) {
        if ($(e.target).closest(".link-tools").length === 0) {
          confirmInput();
        }
      }

      function confirmInput() {
        scribe.updateContents(function() {
          var linkVal = $input.val();
          if (linkVal === "") {
            removeLink();
          }
          else {
            $('.link-edit, [href=' + placeHolder + ']')
              .attr('href', linkVal)
              .removeClass('link-edit');
          }
        }, false);
        $('body, .link-tools .close').unbind('click');
        $linkTools.hide();
      }

      function removeLink() {
        var link = $('.link-edit, [href*=' + placeHolder + ']');
        link[0].outerHTML = link[0].innerHTML;
      }

      linkPromptCommand.queryState = function () {
        /**
         * We override the native `document.queryCommandState` for links because
         * the `createLink` and `unlink` commands are not supported.
         * As per: http://jsbin.com/OCiJUZO/1/edit?js,console,output
         */
        var selection = new scribe.api.Selection();
        return !! selection.getContaining(function (node) {
          return node.nodeName === this.nodeName;
        }.bind(this));
      };

      scribe.commands.linkUI = linkPromptCommand;
    };
  };
});
/*
  
  This is lifted from 

*/

// UMD
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('html-janitor',factory);
  } else {
    root.amdWeb = factory();
  }
}(this, function () {

  function HTMLJanitor(config) {
    this.config = config;
  }

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV'];
  function isBlockElement(node) {
    return blockElementNames.indexOf(node.nodeName) !== -1;
  }

  var inlineElementNames = ['A', 'B', 'DEL', 'I', 'U'];
  function nodeIsInlineElement(node) {
    return inlineElementNames.indexOf(node.nodeName) !== -1;
  }

  HTMLJanitor.prototype.clean = function (html) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = html;

    this._sanitize(sandbox);

    return sandbox.innerHTML;
  };

  HTMLJanitor.prototype._sanitize = function (parentNode) {
    var treeWalker = createTreeWalker(parentNode);
    var node = treeWalker.firstChild();
    if (!node) { return; }

    do {
      var nodeName = node.nodeName.toLowerCase();
      var allowedAttrs = this.config.tags[nodeName];

      // Ignore nodes that have already been sanitized
      if (node._sanitized) {
        continue;
      }


      // Do not sanitize blocks that match 
      if (this.config.skipSanitization(node)) {
        return;
      }



      if (node.nodeType === Node.TEXT_NODE) {
        // If this text node is just whitespace and the previous or next element
        // sibling is a block element, remove it
        // N.B.: This heuristic could change. Very specific to a bug with
        // `contenteditable` in Firefox: http://jsbin.com/EyuKase/1/edit?js,output
        // FIXME: make this an option?
        if (node.data.trim() === ''
            && ((node.previousElementSibling && isBlockElement(node.previousElementSibling))
                 || (node.nextElementSibling && isBlockElement(node.nextElementSibling)))) {
          parentNode.removeChild(node);
          this._sanitize(parentNode);
          break;
        } else {
          continue;
        }
      }

      // Remove all comments
      if (node.nodeType === Node.COMMENT_NODE) {
        parentNode.removeChild(node);
        this._sanitize(parentNode);
        break;
      }

      var isInlineElement = nodeIsInlineElement(node);
      var containsBlockElement;
      if (isInlineElement) {
        containsBlockElement = Array.prototype.some.call(node.childNodes, isBlockElement);
      }

      var isInvalid = isInlineElement && containsBlockElement;

      // Block elements should not be nested (e.g. <li><p>...); if
      // they are, we want to unwrap the inner block element.
      var isNotTopContainer = !! parentNode.parentNode;
      // TODO: Don't hardcore this — this is not invalid markup. Should be
      // configurable.
      var isNestedBlockElement =
            isBlockElement(parentNode) &&
            isBlockElement(node) &&
            isNotTopContainer;

      // Drop tag entirely according to the whitelist *and* if the markup
      // is invalid.
      if (!this.config.tags[nodeName] || isInvalid || isNestedBlockElement) {
        // Do not keep the inner text of SCRIPT/STYLE elements.
        if (! (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE')) {
          while (node.childNodes.length > 0) {
            parentNode.insertBefore(node.childNodes[0], node);
          }
        }
        parentNode.removeChild(node);

        this._sanitize(parentNode);
        break;
      }

      // Sanitize attributes
      for (var a = 0; a < node.attributes.length; a += 1) {
        var attr = node.attributes[a];
        var attrName = attr.name.toLowerCase();

        // Allow attribute?
        var allowedAttrValue = allowedAttrs[attrName];
        var notInAttrList = ! allowedAttrValue;
        var valueNotAllowed = allowedAttrValue !== true && attr.value !== allowedAttrValue;
        if (notInAttrList || valueNotAllowed) {
          node.removeAttribute(attr.name);
          // Shift the array to continue looping.
          a = a - 1;
        }
      }

      // Sanitize children
      this._sanitize(node);

      // Mark node as sanitized so it's ignored in future runs
      node._sanitized = true;
    } while ((node = treeWalker.nextSibling()));
  };

  function createTreeWalker(node) {
    return document.createTreeWalker(node,
                                     NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT);
  }

  return HTMLJanitor;

}));
//# sourceMappingURL=html-janitor.js.map;
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/isNative',[], function() {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  return isNative;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/objectTypes',[], function() {

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  return objectTypes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isObject',['../internals/objectTypes'], function(objectTypes) {

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  return isObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/noop',[], function() {

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  return noop;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreate',['./isNative', '../objects/isObject', '../utilities/noop'], function(isNative, isObject, noop) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || window.Object();
      };
    }());
  }

  return baseCreate;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/setBindData',['./isNative', '../utilities/noop'], function(isNative, noop) {

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  return setBindData;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/slice',[], function() {

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  return slice;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseBind',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseBind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateWrapper',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseCreateWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isFunction',[], function() {

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  return isFunction;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/createWrapper',['./baseBind', './baseCreateWrapper', '../objects/isFunction', './slice'], function(baseBind, baseCreateWrapper, isFunction, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push,
      unshift = arrayRef.unshift;

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  return createWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/bind',['../internals/createWrapper', '../internals/slice'], function(createWrapper, slice) {

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  return bind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/identity',[], function() {

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  return identity;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/support',['./internals/isNative'], function(isNative) {

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = {};

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  return support;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateCallback',['../functions/bind', '../utilities/identity', './setBindData', '../support'], function(bind, identity, setBindData, support) {

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString;

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  return baseCreateCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimKeys',['./objectTypes'], function(objectTypes) {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = function(object) {
    var index, iterable = object, result = [];
    if (!iterable) return result;
    if (!(objectTypes[typeof object])) return result;
      for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
          result.push(index);
        }
      }
    return result
  };

  return shimKeys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/keys',['../internals/isNative', './isObject', '../internals/shimKeys'], function(isNative, isObject, shimKeys) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    return nativeKeys(object);
  };

  return keys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forOwn',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forOwn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/forEach',['../internals/baseCreateCallback', '../objects/forOwn'], function(baseCreateCallback, forOwn) {

  /**
   * Iterates over elements of a collection, executing the callback for each
   * element. The callback is bound to `thisArg` and invoked with three arguments;
   * (value, index|key, collection). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * Note: As with other "Collections" methods, objects with a `length` property
   * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
   * may be used for object iteration.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Array|Object|string} Returns `collection`.
   * @example
   *
   * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
   * // => logs each number and returns '1,2,3'
   *
   * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
   * // => logs each number and returns the object (property order is not guaranteed across environments)
   */
  function forEach(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0;

    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    if (typeof length == 'number') {
      while (++index < length) {
        if (callback(collection[index], index, collection) === false) {
          break;
        }
      }
    } else {
      forOwn(collection, callback);
    }
    return collection;
  }

  return forEach;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArray',['../internals/isNative'], function(isNative) {

  /** `Object#toString` result shortcuts */
  var arrayClass = '[object Array]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == arrayClass || false;
  };

  return isArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forIn',['../internals/baseCreateCallback', '../internals/objectTypes'], function(baseCreateCallback, objectTypes) {

  /**
   * Iterates over own and inherited enumerable properties of an object,
   * executing the callback for each property. The callback is bound to `thisArg`
   * and invoked with three arguments; (value, key, object). Callbacks may exit
   * iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * Shape.prototype.move = function(x, y) {
   *   this.x += x;
   *   this.y += y;
   * };
   *
   * _.forIn(new Shape, function(value, key) {
   *   console.log(key);
   * });
   * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
   */
  var forIn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      for (index in iterable) {
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forIn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimIsPlainObject',['../objects/forIn', '../objects/isFunction'], function(forIn, isFunction) {

  /** `Object#toString` result shortcuts */
  var objectClass = '[object Object]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `isPlainObject` which checks if a given value
   * is an object created by the `Object` constructor, assuming objects created
   * by the `Object` constructor have no inherited enumerable properties and that
   * there are no `Object.prototype` extensions.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   */
  function shimIsPlainObject(value) {
    var ctor,
        result;

    // avoid non Object objects, `arguments` objects, and DOM elements
    if (!(value && toString.call(value) == objectClass) ||
        (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
      return false;
    }
    // In most environments an object's own properties are iterated before
    // its inherited properties. If the last iterated property is an object's
    // own property then there are no inherited enumerable properties.
    forIn(value, function(value, key) {
      result = key;
    });
    return typeof result == 'undefined' || hasOwnProperty.call(value, result);
  }

  return shimIsPlainObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isPlainObject',['../internals/isNative', '../internals/shimIsPlainObject'], function(isNative, shimIsPlainObject) {

  /** `Object#toString` result shortcuts */
  var objectClass = '[object Object]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf;

  /**
   * Checks if `value` is an object created by the `Object` constructor.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Shape() {
   *   this.x = 0;
   *   this.y = 0;
   * }
   *
   * _.isPlainObject(new Shape);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   */
  var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
    if (!(value && toString.call(value) == objectClass)) {
      return false;
    }
    var valueOf = value.valueOf,
        objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

    return objProto
      ? (value == objProto || getPrototypeOf(value) == objProto)
      : shimIsPlainObject(value);
  };

  return isPlainObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseMerge',['../collections/forEach', '../objects/forOwn', '../objects/isArray', '../objects/isPlainObject'], function(forEach, forOwn, isArray, isPlainObject) {

  /**
   * The base implementation of `_.merge` without argument juggling or support
   * for `thisArg` binding.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {Function} [callback] The function to customize merging properties.
   * @param {Array} [stackA=[]] Tracks traversed source objects.
   * @param {Array} [stackB=[]] Associates values with source counterparts.
   */
  function baseMerge(object, source, callback, stackA, stackB) {
    (isArray(source) ? forEach : forOwn)(source, function(source, key) {
      var found,
          isArr,
          result = source,
          value = object[key];

      if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
        // avoid merging previously merged cyclic sources
        var stackLength = stackA.length;
        while (stackLength--) {
          if ((found = stackA[stackLength] == source)) {
            value = stackB[stackLength];
            break;
          }
        }
        if (!found) {
          var isShallow;
          if (callback) {
            result = callback(value, source);
            if ((isShallow = typeof result != 'undefined')) {
              value = result;
            }
          }
          if (!isShallow) {
            value = isArr
              ? (isArray(value) ? value : [])
              : (isPlainObject(value) ? value : {});
          }
          // add `source` and associated `value` to the stack of traversed objects
          stackA.push(source);
          stackB.push(value);

          // recursively merge objects and arrays (susceptible to call stack limits)
          if (!isShallow) {
            baseMerge(value, source, callback, stackA, stackB);
          }
        }
      }
      else {
        if (callback) {
          result = callback(value, source);
          if (typeof result == 'undefined') {
            result = source;
          }
        }
        if (typeof result != 'undefined') {
          value = result;
        }
      }
      object[key] = value;
    });
  }

  return baseMerge;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/arrayPool',[], function() {

  /** Used to pool arrays and objects used internally */
  var arrayPool = [];

  return arrayPool;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/getArray',['./arrayPool'], function(arrayPool) {

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  return getArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/maxPoolSize',[], function() {

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  return maxPoolSize;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/releaseArray',['./arrayPool', './maxPoolSize'], function(arrayPool, maxPoolSize) {

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  return releaseArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/merge',['../internals/baseCreateCallback', '../internals/baseMerge', '../internals/getArray', './isObject', '../internals/releaseArray', '../internals/slice'], function(baseCreateCallback, baseMerge, getArray, isObject, releaseArray, slice) {

  /**
   * Recursively merges own enumerable properties of the source object(s), that
   * don't resolve to `undefined` into the destination object. Subsequent sources
   * will overwrite property assignments of previous sources. If a callback is
   * provided it will be executed to produce the merged values of the destination
   * and source properties. If the callback returns `undefined` merging will
   * be handled by the method instead. The callback is bound to `thisArg` and
   * invoked with two arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize merging properties.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * var names = {
   *   'characters': [
   *     { 'name': 'barney' },
   *     { 'name': 'fred' }
   *   ]
   * };
   *
   * var ages = {
   *   'characters': [
   *     { 'age': 36 },
   *     { 'age': 40 }
   *   ]
   * };
   *
   * _.merge(names, ages);
   * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
   *
   * var food = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var otherFood = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * _.merge(food, otherFood, function(a, b) {
   *   return _.isArray(a) ? a.concat(b) : undefined;
   * });
   * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
   */
  function merge(object) {
    var args = arguments,
        length = 2;

    if (!isObject(object)) {
      return object;
    }
    // allows working with `_.reduce` and `_.reduceRight` without using
    // their `index` and `collection` arguments
    if (typeof args[2] != 'number') {
      length = args.length;
    }
    if (length > 3 && typeof args[length - 2] == 'function') {
      var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
    } else if (length > 2 && typeof args[length - 1] == 'function') {
      callback = args[--length];
    }
    var sources = slice(arguments, 1, length),
        index = -1,
        stackA = getArray(),
        stackB = getArray();

    while (++index < length) {
      baseMerge(object, sources[index], callback, stackA, stackB);
    }
    releaseArray(stackA);
    releaseArray(stackB);
    return object;
  }

  return merge;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/assign',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources will overwrite property assignments of previous
   * sources. If a callback is provided it will be executed to produce the
   * assigned values. The callback is bound to `thisArg` and invoked with two
   * arguments; (objectValue, sourceValue).
   *
   * @static
   * @memberOf _
   * @type Function
   * @alias extend
   * @category Objects
   * @param {Object} object The destination object.
   * @param {...Object} [source] The source objects.
   * @param {Function} [callback] The function to customize assigning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns the destination object.
   * @example
   *
   * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
   * // => { 'name': 'fred', 'employer': 'slate' }
   *
   * var defaults = _.partialRight(_.assign, function(a, b) {
   *   return typeof a == 'undefined' ? b : a;
   * });
   *
   * var object = { 'name': 'barney' };
   * defaults(object, { 'name': 'fred', 'employer': 'slate' });
   * // => { 'name': 'barney', 'employer': 'slate' }
   */
  var assign = function(object, source, guard) {
    var index, iterable = object, result = iterable;
    if (!iterable) return result;
    var args = arguments,
        argsIndex = 0,
        argsLength = typeof guard == 'number' ? 2 : args.length;
    if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
      var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
    } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
      callback = args[--argsLength];
    }
    while (++argsIndex < argsLength) {
      iterable = args[argsIndex];
      if (iterable && objectTypes[typeof iterable]) {
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
      }
      }
    }
    return result
  };

  return assign;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseClone',['../objects/assign', '../collections/forEach', '../objects/forOwn', './getArray', '../objects/isArray', '../objects/isObject', './releaseArray', './slice'], function(assign, forEach, forOwn, getArray, isArray, isObject, releaseArray, slice) {

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to lookup a built-in constructor by [[Class]] */
  var ctorByClass = {};
  ctorByClass[arrayClass] = Array;
  ctorByClass[boolClass] = Boolean;
  ctorByClass[dateClass] = Date;
  ctorByClass[funcClass] = Function;
  ctorByClass[objectClass] = Object;
  ctorByClass[numberClass] = Number;
  ctorByClass[regexpClass] = RegExp;
  ctorByClass[stringClass] = String;

  /**
   * The base implementation of `_.clone` without argument juggling or support
   * for `thisArg` binding.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} [isDeep=false] Specify a deep clone.
   * @param {Function} [callback] The function to customize cloning values.
   * @param {Array} [stackA=[]] Tracks traversed source objects.
   * @param {Array} [stackB=[]] Associates clones with source counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, isDeep, callback, stackA, stackB) {
    if (callback) {
      var result = callback(value);
      if (typeof result != 'undefined') {
        return result;
      }
    }
    // inspect [[Class]]
    var isObj = isObject(value);
    if (isObj) {
      var className = toString.call(value);
      if (!cloneableClasses[className]) {
        return value;
      }
      var ctor = ctorByClass[className];
      switch (className) {
        case boolClass:
        case dateClass:
          return new ctor(+value);

        case numberClass:
        case stringClass:
          return new ctor(value);

        case regexpClass:
          result = ctor(value.source, reFlags.exec(value));
          result.lastIndex = value.lastIndex;
          return result;
      }
    } else {
      return value;
    }
    var isArr = isArray(value);
    if (isDeep) {
      // check for circular references and return corresponding clone
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == value) {
          return stackB[length];
        }
      }
      result = isArr ? ctor(value.length) : {};
    }
    else {
      result = isArr ? slice(value) : assign({}, value);
    }
    // add array properties assigned by `RegExp#exec`
    if (isArr) {
      if (hasOwnProperty.call(value, 'index')) {
        result.index = value.index;
      }
      if (hasOwnProperty.call(value, 'input')) {
        result.input = value.input;
      }
    }
    // exit for shallow clone
    if (!isDeep) {
      return result;
    }
    // add the source value to the stack of traversed objects
    // and associate it with its clone
    stackA.push(value);
    stackB.push(result);

    // recursively populate clone (susceptible to call stack limits)
    (isArr ? forEach : forOwn)(value, function(objValue, key) {
      result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
    });

    if (initedStack) {
      releaseArray(stackA);
      releaseArray(stackB);
    }
    return result;
  }

  return baseClone;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/cloneDeep',['../internals/baseClone', '../internals/baseCreateCallback'], function(baseClone, baseCreateCallback) {

  /**
   * Creates a deep clone of `value`. If a callback is provided it will be
   * executed to produce the cloned values. If the callback returns `undefined`
   * cloning will be handled by the method instead. The callback is bound to
   * `thisArg` and invoked with one argument; (value).
   *
   * Note: This method is loosely based on the structured clone algorithm. Functions
   * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
   * objects created by constructors other than `Object` are cloned to plain `Object` objects.
   * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to deep clone.
   * @param {Function} [callback] The function to customize cloning values.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {*} Returns the deep cloned value.
   * @example
   *
   * var characters = [
   *   { 'name': 'barney', 'age': 36 },
   *   { 'name': 'fred',   'age': 40 }
   * ];
   *
   * var deep = _.cloneDeep(characters);
   * deep[0] === characters[0];
   * // => false
   *
   * var view = {
   *   'label': 'docs',
   *   'node': element
   * };
   *
   * var clone = _.cloneDeep(view, function(value) {
   *   return _.isElement(value) ? value.cloneNode(true) : undefined;
   * });
   *
   * clone.node == view.node;
   * // => false
   */
  function cloneDeep(value, callback, thisArg) {
    return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
  }

  return cloneDeep;
});

define('scribe-plugin-sanitizer',[
  'html-janitor',
  'lodash-amd/modern/objects/merge',
  'lodash-amd/modern/objects/cloneDeep'
], function (
  HTMLJanitor,
  merge,
  cloneDeep
) {

  /**
   * This plugin adds the ability to sanitize content when it is pasted into the
   * scribe, adhering to a whitelist of allowed tags and attributes.
   */

  

  return function (config) {
    // We extend the config to let through Scribe position markers,
    // otherwise we lose the caret position when running the Scribe
    // content through this sanitizer.
    var configAllowMarkers = merge(cloneDeep(config), {
      tags: {
        em: {class: 'scribe-marker'}
      }
    });

    return function (scribe) {
      var janitor = new HTMLJanitor(configAllowMarkers);

      scribe.registerHTMLFormatter('sanitize', janitor.clean.bind(janitor));
    };
  };

});

//# sourceMappingURL=scribe-plugin-sanitizer.js.map;
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseIndexOf',[], function() {

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  return baseIndexOf;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/isNative',[], function() {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /** Used to detect if a method is native */
  var reNative = RegExp('^' +
    String(toString)
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/toString| for [^\]]+/g, '.*?') + '$'
  );

  /**
   * Checks if `value` is a native function.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
   */
  function isNative(value) {
    return typeof value == 'function' && reNative.test(value);
  }

  return isNative;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/objectTypes',[], function() {

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  return objectTypes;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isObject',['../internals/objectTypes'], function(objectTypes) {

  /**
   * Checks if `value` is the language type of Object.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // check if the value is the ECMAScript language type of Object
    // http://es5.github.io/#x8
    // and avoid a V8 bug
    // http://code.google.com/p/v8/issues/detail?id=2291
    return !!(value && objectTypes[typeof value]);
  }

  return isObject;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/noop',[], function() {

  /**
   * A no-operation function.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // no operation performed
  }

  return noop;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreate',['./isNative', '../objects/isObject', '../utilities/noop'], function(isNative, isObject, noop) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  function baseCreate(prototype, properties) {
    return isObject(prototype) ? nativeCreate(prototype) : {};
  }
  // fallback for browsers without `Object.create`
  if (!nativeCreate) {
    baseCreate = (function() {
      function Object() {}
      return function(prototype) {
        if (isObject(prototype)) {
          Object.prototype = prototype;
          var result = new Object;
          Object.prototype = null;
        }
        return result || window.Object();
      };
    }());
  }

  return baseCreate;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/setBindData',['./isNative', '../utilities/noop'], function(isNative, noop) {

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to set meta data on functions */
  var defineProperty = (function() {
    // IE 8 only accepts DOM elements
    try {
      var o = {},
          func = isNative(func = Object.defineProperty) && func,
          result = func(o, o, o) && func;
    } catch(e) { }
    return result;
  }());

  /**
   * Sets `this` binding data on a given function.
   *
   * @private
   * @param {Function} func The function to set data on.
   * @param {Array} value The data array to set.
   */
  var setBindData = !defineProperty ? noop : function(func, value) {
    descriptor.value = value;
    defineProperty(func, '__bindData__', descriptor);
  };

  return setBindData;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/slice',[], function() {

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  return slice;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseBind',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `_.bind` that creates the bound function and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new bound function.
   */
  function baseBind(bindData) {
    var func = bindData[0],
        partialArgs = bindData[2],
        thisArg = bindData[4];

    function bound() {
      // `Function#bind` spec
      // http://es5.github.io/#x15.3.4.5
      if (partialArgs) {
        // avoid `arguments` object deoptimizations by using `slice` instead
        // of `Array.prototype.slice.call` and not assigning `arguments` to a
        // variable as a ternary expression
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      // mimic the constructor's `return` behavior
      // http://es5.github.io/#x13.2.2
      if (this instanceof bound) {
        // ensure `new bound` is an instance of `func`
        var thisBinding = baseCreate(func.prototype),
            result = func.apply(thisBinding, args || arguments);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisArg, args || arguments);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseBind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateWrapper',['./baseCreate', '../objects/isObject', './setBindData', './slice'], function(baseCreate, isObject, setBindData, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push;

  /**
   * The base implementation of `createWrapper` that creates the wrapper and
   * sets its meta data.
   *
   * @private
   * @param {Array} bindData The bind data array.
   * @returns {Function} Returns the new function.
   */
  function baseCreateWrapper(bindData) {
    var func = bindData[0],
        bitmask = bindData[1],
        partialArgs = bindData[2],
        partialRightArgs = bindData[3],
        thisArg = bindData[4],
        arity = bindData[5];

    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        key = func;

    function bound() {
      var thisBinding = isBind ? thisArg : this;
      if (partialArgs) {
        var args = slice(partialArgs);
        push.apply(args, arguments);
      }
      if (partialRightArgs || isCurry) {
        args || (args = slice(arguments));
        if (partialRightArgs) {
          push.apply(args, partialRightArgs);
        }
        if (isCurry && args.length < arity) {
          bitmask |= 16 & ~32;
          return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
        }
      }
      args || (args = arguments);
      if (isBindKey) {
        func = thisBinding[key];
      }
      if (this instanceof bound) {
        thisBinding = baseCreate(func.prototype);
        var result = func.apply(thisBinding, args);
        return isObject(result) ? result : thisBinding;
      }
      return func.apply(thisBinding, args);
    }
    setBindData(bound, bindData);
    return bound;
  }

  return baseCreateWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isFunction',[], function() {

  /**
   * Checks if `value` is a function.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   */
  function isFunction(value) {
    return typeof value == 'function';
  }

  return isFunction;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/createWrapper',['./baseBind', './baseCreateWrapper', '../objects/isFunction', './slice'], function(baseBind, baseCreateWrapper, isFunction, slice) {

  /**
   * Used for `Array` method references.
   *
   * Normally `Array.prototype` would suffice, however, using an array literal
   * avoids issues in Narwhal.
   */
  var arrayRef = [];

  /** Native method shortcuts */
  var push = arrayRef.push,
      unshift = arrayRef.unshift;

  /**
   * Creates a function that, when called, either curries or invokes `func`
   * with an optional `this` binding and partially applied arguments.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of method flags to compose.
   *  The bitmask may be composed of the following flags:
   *  1 - `_.bind`
   *  2 - `_.bindKey`
   *  4 - `_.curry`
   *  8 - `_.curry` (bound)
   *  16 - `_.partial`
   *  32 - `_.partialRight`
   * @param {Array} [partialArgs] An array of arguments to prepend to those
   *  provided to the new function.
   * @param {Array} [partialRightArgs] An array of arguments to append to those
   *  provided to the new function.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new function.
   */
  function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
    var isBind = bitmask & 1,
        isBindKey = bitmask & 2,
        isCurry = bitmask & 4,
        isCurryBound = bitmask & 8,
        isPartial = bitmask & 16,
        isPartialRight = bitmask & 32;

    if (!isBindKey && !isFunction(func)) {
      throw new TypeError;
    }
    if (isPartial && !partialArgs.length) {
      bitmask &= ~16;
      isPartial = partialArgs = false;
    }
    if (isPartialRight && !partialRightArgs.length) {
      bitmask &= ~32;
      isPartialRight = partialRightArgs = false;
    }
    var bindData = func && func.__bindData__;
    if (bindData && bindData !== true) {
      // clone `bindData`
      bindData = slice(bindData);
      if (bindData[2]) {
        bindData[2] = slice(bindData[2]);
      }
      if (bindData[3]) {
        bindData[3] = slice(bindData[3]);
      }
      // set `thisBinding` is not previously bound
      if (isBind && !(bindData[1] & 1)) {
        bindData[4] = thisArg;
      }
      // set if previously bound but not currently (subsequent curried functions)
      if (!isBind && bindData[1] & 1) {
        bitmask |= 8;
      }
      // set curried arity if not yet set
      if (isCurry && !(bindData[1] & 4)) {
        bindData[5] = arity;
      }
      // append partial left arguments
      if (isPartial) {
        push.apply(bindData[2] || (bindData[2] = []), partialArgs);
      }
      // append partial right arguments
      if (isPartialRight) {
        unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
      }
      // merge flags
      bindData[1] |= bitmask;
      return createWrapper.apply(null, bindData);
    }
    // fast path for `_.bind`
    var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
    return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
  }

  return createWrapper;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/functions/bind',['../internals/createWrapper', '../internals/slice'], function(createWrapper, slice) {

  /**
   * Creates a function that, when called, invokes `func` with the `this`
   * binding of `thisArg` and prepends any additional `bind` arguments to those
   * provided to the bound function.
   *
   * @static
   * @memberOf _
   * @category Functions
   * @param {Function} func The function to bind.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {...*} [arg] Arguments to be partially applied.
   * @returns {Function} Returns the new bound function.
   * @example
   *
   * var func = function(greeting) {
   *   return greeting + ' ' + this.name;
   * };
   *
   * func = _.bind(func, { 'name': 'fred' }, 'hi');
   * func();
   * // => 'hi fred'
   */
  function bind(func, thisArg) {
    return arguments.length > 2
      ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
      : createWrapper(func, 1, null, null, thisArg);
  }

  return bind;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/utilities/identity',[], function() {

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'name': 'fred' };
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  return identity;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/support',['./internals/isNative'], function(isNative) {

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /**
   * An object used to flag environments features.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = {};

  /**
   * Detect if functions can be decompiled by `Function#toString`
   * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcDecomp = !isNative(window.WinRTError) && reThis.test(function() { return this; });

  /**
   * Detect if `Function#name` is supported (all but IE).
   *
   * @memberOf _.support
   * @type boolean
   */
  support.funcNames = typeof Function.name == 'string';

  return support;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/baseCreateCallback',['../functions/bind', '../utilities/identity', './setBindData', '../support'], function(bind, identity, setBindData, support) {

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Native method shortcuts */
  var fnToString = Function.prototype.toString;

  /**
   * The base implementation of `_.createCallback` without support for creating
   * "_.pluck" or "_.where" style callbacks.
   *
   * @private
   * @param {*} [func=identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of the created callback.
   * @param {number} [argCount] The number of arguments the callback accepts.
   * @returns {Function} Returns a callback function.
   */
  function baseCreateCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    // exit early for no `thisArg` or already bound by `Function#bind`
    if (typeof thisArg == 'undefined' || !('prototype' in func)) {
      return func;
    }
    var bindData = func.__bindData__;
    if (typeof bindData == 'undefined') {
      if (support.funcNames) {
        bindData = !func.name;
      }
      bindData = bindData || !support.funcDecomp;
      if (!bindData) {
        var source = fnToString.call(func);
        if (!support.funcNames) {
          bindData = !reFuncName.test(source);
        }
        if (!bindData) {
          // checks if `func` references the `this` keyword and stores the result
          bindData = reThis.test(source);
          setBindData(func, bindData);
        }
      }
    }
    // exit early if there are no `this` references or `func` is bound
    if (bindData === false || (bindData !== true && bindData[1] & 1)) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 2: return function(a, b) {
        return func.call(thisArg, a, b);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
    }
    return bind(func, thisArg);
  }

  return baseCreateCallback;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/internals/shimKeys',['./objectTypes'], function(objectTypes) {

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Native method shortcuts */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * A fallback implementation of `Object.keys` which produces an array of the
   * given object's own enumerable property names.
   *
   * @private
   * @type Function
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   */
  var shimKeys = function(object) {
    var index, iterable = object, result = [];
    if (!iterable) return result;
    if (!(objectTypes[typeof object])) return result;
      for (index in iterable) {
        if (hasOwnProperty.call(iterable, index)) {
          result.push(index);
        }
      }
    return result
  };

  return shimKeys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/keys',['../internals/isNative', './isObject', '../internals/shimKeys'], function(isNative, isObject, shimKeys) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys;

  /**
   * Creates an array composed of the own enumerable property names of an object.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {Object} object The object to inspect.
   * @returns {Array} Returns an array of property names.
   * @example
   *
   * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
   * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    if (!isObject(object)) {
      return [];
    }
    return nativeKeys(object);
  };

  return keys;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/forOwn',['../internals/baseCreateCallback', './keys', '../internals/objectTypes'], function(baseCreateCallback, keys, objectTypes) {

  /**
   * Iterates over own enumerable properties of an object, executing the callback
   * for each property. The callback is bound to `thisArg` and invoked with three
   * arguments; (value, key, object). Callbacks may exit iteration early by
   * explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {Object} object The object to iterate over.
   * @param {Function} [callback=identity] The function called per iteration.
   * @param {*} [thisArg] The `this` binding of `callback`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
   *   console.log(key);
   * });
   * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
   */
  var forOwn = function(collection, callback, thisArg) {
    var index, iterable = collection, result = iterable;
    if (!iterable) return result;
    if (!objectTypes[typeof iterable]) return result;
    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      var ownIndex = -1,
          ownProps = objectTypes[typeof iterable] && keys(iterable),
          length = ownProps ? ownProps.length : 0;

      while (++ownIndex < length) {
        index = ownProps[ownIndex];
        if (callback(iterable[index], index, collection) === false) return result;
      }
    return result
  };

  return forOwn;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isArray',['../internals/isNative'], function(isNative) {

  /** `Object#toString` result shortcuts */
  var arrayClass = '[object Array]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

  /**
   * Checks if `value` is an array.
   *
   * @static
   * @memberOf _
   * @type Function
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
   * @example
   *
   * (function() { return _.isArray(arguments); })();
   * // => false
   *
   * _.isArray([1, 2, 3]);
   * // => true
   */
  var isArray = nativeIsArray || function(value) {
    return value && typeof value == 'object' && typeof value.length == 'number' &&
      toString.call(value) == arrayClass || false;
  };

  return isArray;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/objects/isString',[], function() {

  /** `Object#toString` result shortcuts */
  var stringClass = '[object String]';

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to resolve the internal [[Class]] of values */
  var toString = objectProto.toString;

  /**
   * Checks if `value` is a string.
   *
   * @static
   * @memberOf _
   * @category Objects
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
   * @example
   *
   * _.isString('fred');
   * // => true
   */
  function isString(value) {
    return typeof value == 'string' ||
      value && typeof value == 'object' && toString.call(value) == stringClass || false;
  }

  return isString;
});

/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="amd" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
define('lodash-amd/modern/collections/contains',['../internals/baseIndexOf', '../objects/forOwn', '../objects/isArray', '../objects/isString'], function(baseIndexOf, forOwn, isArray, isString) {

  /* Native method shortcuts for methods with the same name as other `lodash` methods */
  var nativeMax = Math.max;

  /**
   * Checks if a given value is present in a collection using strict equality
   * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
   * offset from the end of the collection.
   *
   * @static
   * @memberOf _
   * @alias include
   * @category Collections
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {*} target The value to check for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
   * @example
   *
   * _.contains([1, 2, 3], 1);
   * // => true
   *
   * _.contains([1, 2, 3], 1, 2);
   * // => false
   *
   * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
   * // => true
   *
   * _.contains('pebbles', 'eb');
   * // => true
   */
  function contains(collection, target, fromIndex) {
    var index = -1,
        indexOf = baseIndexOf,
        length = collection ? collection.length : 0,
        result = false;

    fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
    if (isArray(collection)) {
      result = indexOf(collection, target, fromIndex) > -1;
    } else if (typeof length == 'number') {
      result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
    } else {
      forOwn(collection, function(value) {
        if (++index >= fromIndex) {
          return !(result = value === target);
        }
      });
    }
    return result;
  }

  return contains;
});

define('scribe-common/src/element',['lodash-amd/modern/collections/contains'], function (contains) {

  

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'DIV', 'BLOCKQUOTE', 'UL', 'OL', 'H1',
                           'H2', 'H3', 'H4', 'H5', 'H6'];
  function isBlockElement(node) {
    return contains(blockElementNames, node.nodeName);
  }

  function isSelectionMarkerNode(node) {
    return (node.nodeType === Node.ELEMENT_NODE && node.className === 'scribe-marker');
  }

  function unwrap(node, childNode) {
    while (childNode.childNodes.length > 0) {
      node.insertBefore(childNode.childNodes[0], childNode);
    }
    node.removeChild(childNode);
  }

  return {
    isBlockElement: isBlockElement,
    isSelectionMarkerNode: isSelectionMarkerNode,
    unwrap: unwrap
  };

});

define('scribe-plugin-smart-lists',['scribe-common/src/element'], function (element) {

  

  return function () {

    var keys = {
      32: 'Space',
      42: '*',
      45: '-',
      46: '.',
      49: '1',
      // Bullet insertion keycode, most likely only working on OS X...
      8226:  '•'
    };

    function isUnorderedListChar(string) {
      return string === '*' || string === '-' || string === '•';
    }

    function findBlockContainer(node) {
      while (node && ! element.isBlockElement(node)) {
        node = node.parentNode;
      }

      return node;
    }

    return function (scribe) {

      var preLastChar, lastChar, currentChar;

      function removeSelectedTextNode() {
        var selection = new scribe.api.Selection();
        var container = selection.selection.anchorNode;
        /**
         * Firefox: Selection object never gets access to text nodes, only
         * parent elements.
         * As per: http://jsbin.com/rotus/2/edit?js,output,console
         * Bugzilla: https://bugzilla.mozilla.org/show_bug.cgi?id=1042701
         */
        var textNode;
        if (container.nodeType === Node.TEXT_NODE) {
          textNode = container;
        } else if (container.firstChild.nodeType === Node.TEXT_NODE) {
          textNode = container.firstChild;
        }

        if (textNode) {
          var parentNode = textNode.parentNode;
          /**
           * Firefox: Given text of "1.", we sometimes have two text nodes
           * (why?): "1" and "."
           */
          if (textNode.previousSibling) {
            parentNode.removeChild(textNode.previousSibling);
          }
          parentNode.removeChild(textNode);
        } else {
          throw new Error('Cannot empty non-text node!');
        }
      }

      function input(event) {
        var listCommand;

        preLastChar = lastChar;
        lastChar = currentChar;
        // FIXME: Chrome / FF, theoretically we should be using event.key?
        //        can we abstract this madness?
        currentChar = keys[event.charCode];

        var selection = new scribe.api.Selection();

        // TODO: if a <p> with just this content
        var container = selection.range.commonAncestorContainer;

        // If in a <p>
        var blockContainer = findBlockContainer(container);
        if (blockContainer && blockContainer.tagName === 'P') {
          // Warning: There is no guarantee that `container` will be a text node
          // Failing Firefox tests

          var startOfLineIsUList = isUnorderedListChar(container.textContent[0]);
          if (isUnorderedListChar(lastChar) && currentChar === 'Space' && startOfLineIsUList) {
            listCommand = 'insertUnorderedList';
          }

          /**
           * Firefox: Selection object never gets access to text nodes, only
           * parent elements. This means that *sometimes* unordered lists
           * will not work.
           * As per: http://jsbin.com/rotus/2/edit?js,output,console
           * Bugzilla: https://bugzilla.mozilla.org/show_bug.cgi?id=1042701
           */

          // Some browsers split text nodes randomly, so we can't be sure the
          // prefix will be contained within a single text node (observed in
          // Firefox)
          var startOfLineIsOList = [
            container.previousSibling && container.previousSibling.textContent,
            container.textContent
          ].join('').slice(0, 2) === '1.';
          if (preLastChar === '1' && lastChar === '.' && currentChar === 'Space' && startOfLineIsOList) {
            listCommand = 'insertOrderedList';
          }
        }

        if (listCommand) {
          // Ignore the typed character
          event.preventDefault();

          scribe.transactionManager.run(function() {
            scribe.getCommand(listCommand).execute();

            // Clear "* "/etc from the list item
            removeSelectedTextNode();
          });
        }
      }

      scribe.el.addEventListener('keypress', input);
    };
  };

});

//# sourceMappingURL=scribe-plugin-smart-lists.js.map;
define('scribe-plugin-toolbar',[],function () {

  

  return function (toolbarNode) {
    return function (scribe) {
      var buttons = toolbarNode.querySelectorAll('[data-command-name]');

      Array.prototype.forEach.call(buttons, function (button) {
        button.addEventListener('click', function () {
          // Look for a predefined command.
          var command = scribe.getCommand(button.dataset.commandName);

          /**
           * Focus will have been taken away from the Scribe instance when
           * clicking on a button (Chrome will return the focus automatically
           * but only if the selection is not collapsed. As per: http://jsbin.com/tupaj/1/edit?html,js,output).
           * It is important that we focus the instance again before executing
           * the command, because it might rely on selection data.
           */
          scribe.el.focus();
          command.execute(button.dataset.commandValue);
          /**
           * Chrome has a bit of magic to re-focus the `contenteditable` when a
           * command is executed.
           * As per: http://jsbin.com/papi/1/edit?html,js,output
           */
        });

        // Keep the state of toolbar buttons in sync with the current selection.
        // Unfortunately, there is no `selectionchange` event.
        scribe.el.addEventListener('keyup', updateUi);
        scribe.el.addEventListener('mouseup', updateUi);

        scribe.el.addEventListener('focus', updateUi);
        scribe.el.addEventListener('blur', updateUi);

        // We also want to update the UI whenever the content changes. This
        // could be when one of the toolbar buttons is actioned.
        scribe.on('content-changed', updateUi);

        function updateUi() {
          // Look for a predefined command.
          var command = scribe.getCommand(button.dataset.commandName);

          var selection = new scribe.api.Selection();

          // TODO: Do we need to check for the selection?
          if (selection.range && command.queryState(button.dataset.commandValue)) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }

          if (selection.range && command.queryEnabled()) {
            button.removeAttribute('disabled');
          } else {
            button.setAttribute('disabled', 'disabled');
          }
        }
      });
    };
  };

});


//# sourceMappingURL=scribe-plugin-toolbar.js.map;

define('scribe-plugin-inline-objects',[],function () {

  /**
   * Adds support for inserting inline objects, like embeds, videos and images.
   */
  return function (config) {
    return function (scribe) {
        // define inline objects

        var editorEl = scribe.el.parentNode;

        var templates;
        var activeBlock, activeElement;

        // Load the config.
        function configLoaded(data) {
          templates = data;
          $('.embed-button', editorEl).click(openFlyout);

          $('.inline-tools button', editorEl.parentNode).click(function(event) {
            var name = $(event.target).data('commandName');
            if (typeof actions[name] === 'function') {
              actions[name]();
            }
          });
        }

        function openFlyout(event) {
          var blockPosition,
              flyoutHeight = $('.embed-fly-out').height(),
              buttonHeight = $('.embed-button').height(),
              beforeOrAfter;

          var command = $(event.target).closest('button').data('commandName');
          if (command === 'embed-before') {
            blockPosition = activeBlock.position().top - flyoutHeight / 2 + buttonHeight / 2;
            beforeOrAfter = 'before';
          }
          else {
            blockPosition = activeBlock.position().top +
              activeBlock.height()
              + parseInt(activeBlock.css('margin-top'))
              - flyoutHeight / 2 + buttonHeight / 2;
            beforeOrAfter = 'after';
          }

          $('.embed-fly-out', editorEl)
            .css({
              top: blockPosition,
              left: $(scribe.el).css('padding-left')
            })
            .show();

          //register click handler for toolbar
          var elementToPlaceNear = activeBlock;
          $('.embed-fly-out button').bind('click.inline', function(e) {
            var type = $(e.target).closest('button').data('commandName');
            insertObject(type, elementToPlaceNear, beforeOrAfter);
          });


          $('body').bind('click.inline', function(e) {
            // if a click happens outside of the flyout, close it.
            if ($(e.target).closest('.embed-tools').length === 0) {
              closeFlyout();
            }
          });
        }


        function closeFlyout() {
          $('body').unbind('click.inline');
          $('.embed-fly-out button').unbind('click.inline');
          $('.embed-fly-out').hide();
        }


        function insertObject(objectType, elementToPlaceNear, beforeOrAfter) {
          //derive type from button clicked.
          //emit an event, so handler plugin can pick up.
          scribe.trigger('inline:insert:' + objectType, [
            function(values) {
              scribe.updateContents(function() {
                var html = render(
                    templates[objectType].template,
                    $.extend(templates[objectType].defaults, values)
                );
                $(elementToPlaceNear)[beforeOrAfter](html);
                $('.inline', editorEl).attr('contenteditable', 'false');
              });
            }
          ]);
          $('.embed-tools', editorEl).removeClass('active');
        }

        // Insert toolbar.
        scribe.el.addEventListener('mouseover', function (event) {
          var block = $(event.target).closest('.editor>*');
          if (block.length === 1) {
            //var top = blocks[i].offsetTop;
            $('.embed-tools',editorEl)
                .css({
                  width: $(scribe.el).css('padding-left'),
                  top: block.position().top + block.css('margin-top').replace(/[^-\d\.]/g, '') / 2,
                  height: block.height()
                })
                .addClass('active');
            activeBlock = block;
          }
          else {
            $('.embed-tools', editorEl).removeClass('active');
          }
        });

        scribe.el.parentNode.addEventListener('mouseleave', function (event) {
          hideToolbar();
          $('.embed-tools', editorEl).removeClass('active');
        });

        // put the actve class back on if hover back into a button
        $('.embed-tools', editorEl).mouseover(function() {
          $('.embed-tools', editorEl).addClass('active');
        });



        // Overlay options
        $('.editor', editorEl).mouseover( function(e) {
          //check to see if the target is inside of an inline element
          var parents = $(e.target).parents('.inline');
          if (parents.length === 1) {
            //let's position tools over the inline element
            activeElement = parents[parents.length-1];
            showToolbar();
          }
          else {
            hideToolbar();
          }
        });

        function hideToolbar() {
          $('.inline-tools').hide();
          $(editorEl).removeClass('inline-active');
        }

        function showToolbar() {
          var el = $(activeElement);
          var pos = el.position();
          $(editorEl).addClass('inline-active');


          // set the type attribute on the overlay, for custom styling.
          $('.inline-tools').attr('data-type', el.attr('data-type'));


          //set size buttons.

          $('.inline-tools .size', editorEl)
            .html($(activeElement).attr('data-size'));

          //set crop
          $('.inline-tools .crop', editorEl)
            .html($(activeElement).attr('data-crop'));

          $('.inline-tools', editorEl)
            .css({
              top: pos.top + parseInt(el.css('margin-top')),
              left: pos.left + parseInt(el.css('margin-left')) + parseInt($('.editor', editorEl).css('margin-left')),
              width: el.width(),
              height: el.height()
            })
            .show();
        }

        function getSizes() {
          return templates[$(activeElement).attr('data-type')].size;
        }

        function getCrops() {
          return templates[$(activeElement).attr('data-type')].crop;
        }

        //TODO: Determine how to handle two adjacent inline elements. Probably skip over?
        var actions = {

          inline_caption: function() {
            var caption = prompt('Caption',
              $('.caption', activeElement).html()
            );
            if (caption || caption === '') {
              scribe.updateContents(function() {
                $('.caption', activeElement).html(caption);
              });
            }
          },
          //TODO: size/crop isn't working right after you hit the 'HUGE' size in images
          inline_size: function() {
            var l = getSizes();
            toggleAttribute('size', l);

            var currentCrop = $(activeElement).attr('data-crop');
            var cropOptions = getCrops();
            //this crop isn't available for the new size option
            if (cropOptions.indexOf(currentCrop) === -1) {
              setValue('crop', cropOptions[0]);
            }
          },
          inline_crop: function() {
            var l = templates[$(activeElement).attr('data-type')].crop;
            toggleAttribute('crop', l);
          },
          inline_up: function() {
             hideToolbar();
            var previousBlock = $(activeElement).prev()[0];
            if (previousBlock) {
              var top = $(activeElement).offset().top;

              scribe.updateContents(function() {
                $(activeElement).after(previousBlock);

                setTimeout(function() {
                  showToolbar();
                  var newTop = $(activeElement).offset().top;
                  window.scrollBy(0, newTop - top);
                }, 0);
              });
            }
          },
          inline_down: function() {
            hideToolbar();
            var nextBlock = $(activeElement).next()[0];
            if (nextBlock) {
              var top = $(activeElement).offset().top;
              scribe.updateContents(function() {
                $(activeElement).before(nextBlock);

                setTimeout(function() {
                  showToolbar();
                  var newTop = $(activeElement).offset().top;
                  window.scrollBy(0, newTop - top);
                }, 0);
              });
            }
          },
          inline_remove: function () {
            scribe.updateContents(function() {
              $(activeElement).remove();
            });
            hideToolbar();
          },
          inline_edit: function () {
            scribe.trigger('inline:edit:' + $(activeElement).attr('data-type'),
              [
                activeElement,
                function(element, values) {
                  var type = $(element).attr('data-type');
                  scribe.updateContents(function() {
                    element.outerHTML =
                      render(
                        templates[type].template,
                        $.extend(templates[type].defaults, values)
                      );
                  });
                }
              ]
            );
          }
        };

        function toggleAttribute(attribute, list) {
          var currentValue = $(activeElement).attr('data-' + attribute);
          var index = list.indexOf(currentValue) + 1;
          if (index >= list.length) {
            index = 0;
          }
          setValue(attribute, list[index]);
          if (typeof window.picturefill === 'function') {
            setTimeout(function() {
              window.picturefill(activeElement);
            }, 100);
          }
        }

        function setValue(attribute, value) {
          var currentValue = $(activeElement).attr('data-' + attribute);
          scribe.updateContents(function() {
            $(activeElement)
              .removeClass(attribute + '-' + currentValue)
              .addClass(attribute + '-' + value)
              .attr('data-' + attribute, value);
              showToolbar();
          });
        }

        function render(html, dict) {
          for (var k in dict) {
            if (k) {
              html = html.replace(new RegExp('{{' + k + '}}', 'g'), dict[k]);
            }
          }
          return html;
        }

        if (typeof config === 'string' || config instanceof String) {
          $.ajax(config, {success: configLoaded, dataType: 'json'});
        } else {
          configLoaded(config);
        }
    };
  };
});

define('scribe-plugin-betty-cropper',[],function () {
  return function (config) {
    return function (scribe) {

        function insert(callback) {
          config.insertDialog().then(
            function(success){
              var format;
              if (success.name.toUpperCase().indexOf('GIF') !== -1) {
                format = 'gif';
              }
              else {
                format = 'jpg';
              }
              callback({image_id: success.id, format: format});
              if (window.picturefill) {
                setTimeout(function() {
                  // this could be nicer...
                  window.picturefill($('[data-image-id=' + success.id + ']')[0]);
                }, 100);
              }
            },
            function(error){
              console.log(error);
            },
            function(progress){
              console.log(progress);
            }
          );
        }

        var current_id;

        function edit(block, callback) {
          current_id = block.getAttribute('data-image-id');
          var caption = $('.caption', block).html();
          var alt = block.getAttribute('data-alt');
          config.editDialog({id: current_id, caption: caption, alt: alt}).then(
            function (image) {

              if (image.id === null) {
                $(block).remove();
              } else {
                $(block).attr('data-image-id', image.id);
                $(block).attr('data-alt', image.alt);
                $('.caption', block).html(image.caption);
                if (window.picturefill) {
                  setTimeout(function() {
                    window.picturefill($('[data-image-id=' + image.id + ']')[0]);
                  }, 100);
                }
              }
            }
          );
        }

        scribe.on('inline:edit:image', edit);
        scribe.on('inline:insert:image', insert);
      };
    };
});
define('scribe-plugin-youtube',[],function () {

  return function (config) {
    return function (scribe) {

        scribe.on("inline:insert:youtube", insert);
        scribe.on("inline:edit:youtube", edit);

        function parseYoutube(url){
          if (!url) return false;
          var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
          var match = url.match(regExp);
          if (match && match[7].length == 11) {
            return match[7];
          }
          else {
            return false;
          }
        }

        function insert(callback) {
          var url = prompt("Youtube URL:");
          var youtube_id  = parseYoutube(url);
          if (youtube_id) {
            callback(
              {
                "youtube_id": youtube_id, 
                "caption": ""
              }
            );
          }
        }
        
        function edit(block, callback) {
          var url = prompt("Youtube URL:", $(block).attr("data-youtube-id") || "");
          var youtube_id  = parseYoutube(url);
          if (youtube_id) {
            callback(
              block,
              {
                "youtube_id": youtube_id, 
                "caption": $(".caption", block).html()
              }
            );
          }
        }
      };
    }
});
define('scribe-plugin-embed',[],function () {
  return function (config) {
    return function (scribe) {
      scribe.on("inline:insert:embed", insert);
      scribe.on("inline:edit:embed", edit);
      var editorEl = scribe.el.parentNode;
      var $modal = $(".embed-modal", editorEl);

      var $bodyInput = $(".embed-body", $modal),
          $captionInput = $(".embed-caption", $modal),
          $embedBtn = $(".set-embed-button", $modal),
          $error = $(".embed-error", $modal),
          $sizeInput = $("[name=size]", $modal);

      $modal.on("hide.bs.modal", function() {
        $embedBtn.unbind("click");
        $error.hide();
      });


      function edit(block, callback) {
        //populate modal contents

        $bodyInput.val(unescape($(block).attr("data-code")));
        $captionInput.val($(".caption", block).text());

        var sizeCropPair = $(block).attr("data-size") + "-" + $(block).attr("data-crop");
        $("[value=" + sizeCropPair + "]", $modal).attr("checked", true);
        $modal.modal("show");
        $embedBtn.click(function () {
          var embedBody = $bodyInput.val();
          if (embedBody.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback(block, {
              code: embedBody,
              caption: $captionInput.val(),
              escaped_code: escape(embedBody),
              size: getSize(),
              crop: getCrop()
            });
            $modal.modal("hide");

          }
        });
        $modal.modal("show");
      }

      function insert(callback) {
        $bodyInput.val("");
        $captionInput.val("");
        $modal.modal("show");

        $embedBtn.click(function () {
          var embedBody = $bodyInput.val();

          if (embedBody.trim() === "") {
             $error.show();
          }
          else {
            $error.hide();
            callback({
              code: embedBody,
              caption: $captionInput.val(),
              escaped_code: escape(embedBody),
              size: getSize(),
              crop: getCrop()
            });
            $modal.modal("hide");
          }
        });
      }

      function getSize() {
        var value = 'original';
        if ($sizeInput.length > 0) {
          $sizeInput.val().split("-")[0]; 
        }
        return value;
      }

      function getCrop() {
        var value = 'original';
        if ($sizeInput.length > 0) {
          $sizeInput.val().split("-")[1]; 
        }
        return value;
      }

    };
  }
});
define('scribe-plugin-onion-video',[],function () {
  return function (config) {
    return function (scribe) {



      scribe.on("inline:edit:onion-video", edit);
      scribe.on("inline:insert:onion-video", insert);


      function insert(callback) {
        
        //TODO: Show some kind of use status while waiting for the initial response.

        return config.insertDialog().then(
            function(videoObject){
              scribe.updateContents(function() {
                callback({embed_url: config.videoEmbedUrl, video_id:videoObject.attrs.id});
              });
            }, function(error){
                onError(error);
            }, function(progress){
                onProgress(progress);
            }
        );

        function onProgress() {
            //update an indicator
        }


        function onError() {
            //show msg, allow user to trigger upload again
        }

        function onCancel() {
            //remove placeholder. Call it a day.
        }

      }

      function edit(block, callback) {
          var id = $(block).attr('data-video-id') || $(block).attr('data-videoid');
          config.editDialog(id);
      }
    };
  }
});
define('scribe-plugin-hr',[],function () {
  return function (config) {
    return function (scribe) {

      scribe.on("inline:insert:hr", insert);

      function insert(callback) {
        callback({});
      }
    };
  }
});
define('scribe-plugin-placeholder',[],function () {

  return function (config) {
    return function (scribe) {
      scribe.on('content-changed', checkForEmpty);
      config.container.innerHTML = config.text;
      function checkForEmpty() {
        var content = scribe.getContent()
        if (content === "<p><br></p>" || content === "") {
          config.container.style.display = '';
        }
        else {
          config.container.style.display = 'none';
        }
      }
    }
  }
});
define('link-formatter',[
    'scribe-common/src/element',
    'lodash-amd/modern/collections/contains'

  ], function (
    element,
    contains
  ) {

  /**
   * This formatter will make sure any urls
   * that are supposed to be relative stay relative to a configured
   * http://www.avclub.com/some-article ==> /some-article
   */

  

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements

  
  return function (config) {
    return function (scribe) {

      function fixLink(url) {
        url = url.trim();
        url = fixProtocol(url);
        if (config.domain) {
          url = makeRelative(url, config.domain);
        }
        return url
      }

      function makeRelative(url, domain) {
          var a = document.createElement("a");
          a.href = url;
          // check if it's an avclub link
          var host = a.hostname;
          // also check that there's a path at the end
          if (host.indexOf(domain) > -1 && a.pathname.length > 1) {
              url = a.pathname + a.search + a.hash;
          }
          return url;
      }

      function fixProtocol(url) {
        if (
            url.substr(0, 7) !== "http://" &&
            url.substr(0, 8) !== "https://" &&
            url.substr(0, 7) !== "mailto:" &&
            url.substr(0, 1) !== "/" 
            ) {
            // check for email, but default to http
            if (url.indexOf("@") != -1) {
              return "mailto:" + url;
            } else {
              return "http://" + url;
            }
        } else {
            return url;
        }
      }

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;

        while (node) {
          if (node.nodeName === 'A') {
            if (node.hasAttribute('href')) {
              node.setAttribute('href', fixLink(node.getAttribute('href')));
            }
          }
          else if (node.children.length > 0) {
            traverse(node);
          }
          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('sanitize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;
        traverse(bin);
        return bin.innerHTML;
      });

    };
  };

});

define('only-trailing-brs',[],function () {

  

  // For single-line mode: Firefox needs a BR at the end to work.
  // However, we don't want multiple BRs since this is a single-line input.
  // So I'm whitelisting BR in the "sanitizer" plugin and adding this guy.
  // This will mess up "inline" objects which rely on BR, of which we
  // currently have none so it's not a big deal.
  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(/<br>(.)/g, ' $1');
      });
    };
  };

});

define('paste-strip-newlines',[],function () {

  

  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('paste', function (html) {
        return html.replace(/\n/g, ' ');
      });
    };
  };

});

define('paste-strip-nbsps',[],function () {

  

  return function () {
    return function (scribe) {
      scribe.registerHTMLFormatter('paste', function (html) {
        return html.replace(/&nbsp;/g, ' ');
      });
      scribe.registerHTMLFormatter('normalize', function (html) {
        return html.replace(/&nbsp;/g, ' ');
      });
    };
  };

});

define('paste-from-word',['scribe-common/src/element'], function (scribeElement) {

  

  return function () {
    return function (scribe) {

      // Flagrantly lifted from TinyMCE
      function isWordContent(html) {
        return (
          (/<font face="Times New Roman"|class="?Mso|style="[^"]*\bmso-|style='[^'']*\bmso-|w:WordDocument/i).test(html) ||
          (/class="OutlineElement/).test(html) ||
          (/id="?docs\-internal\-guid\-/.test(html))
        );
      }

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        
        while (node) {
          var nextNode = node.nextElementSibling;

          // Kill "Mso*" class names
          if (node.className.indexOf('Mso') === 0) {
            node.className = null;
          }

          if (node.hasAttribute('style')) {
            node.removeAttribute('style');
          }

          if (node.children.length > 0) {
            traverse(node);
          }

          // Kill bullshit a tags
          if (node.nodeName === 'A') {
            if (!node.href) {  // There are a bunch of tags taht are basically bookmarks. We don't need 'em.
              scribeElement.unwrap(parentNode, node);
            }
          }

          node = nextNode;
        }
      }

      scribe.registerHTMLFormatter('paste', function (html) {
        if (!isWordContent(html)) {
          // We only want to fuck with word docs. Word docs are crazy.
          return html;
        }

        // Word comments like conditional comments etc
        html = html.replace(/<!--[\s\S]+?-->/gi, '');

        // Remove comments, scripts (e.g., msoShowComment), XML tag, VML content,
        // MS Office namespaced tags, and a few other tags
        html = html.replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|img|meta|link|style|\w:\w+)(?=[\s\/>]))[^>]*>/gi, '');
        
        // Now let's use this thing as a doc.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);

        // In the end, we really only care about the body.
        return bin.innerHTML;
      });
    };
  };

});
define('paste-sanitize',['scribe-common/src/element'], function (scribeElement) {

  

  return function () {
    return function (scribe) {

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;
        
        while (node) {
          var nextNode = node.nextElementSibling;

          if (node.children.length > 0) {
            traverse(node);
          }

          if (node.hasAttribute('style')) {
            node.removeAttribute('style');
          }

          // There seem to be a bunch of empty p tags, that cause all kinds of trouble.
          if (node.nodeName === 'P' && node.textContent.trim() === '') {
            parentNode.removeChild(node); // Kill these empty p tagz
          }

          // FUCK YO SPANS
          if (node.nodeName === 'SPAN') {
            scribeElement.unwrap(parentNode, node);
          }

          node = nextNode;
        }
      }

      scribe.registerHTMLFormatter('paste', function (html) {

        var bin = document.createElement('div');
        bin.innerHTML = html;

        var childNodes = [].slice.call(bin.childNodes);
        childNodes.forEach(function(childNode) {
          if (childNode.nodeType === 3 && childNode.textContent.trim() === '') {
            // Kill all empty spaces between tags.
            bin.removeChild(childNode);
          }
        });

        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});

define('remove-a-styles',['scribe-common/src/element'], function (scribeElement) {

  

  return function () {
    return function (scribe) {

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;

        while (node) {
          if (node.nodeName === 'A' && node.hasAttribute('style')) {
            node.removeAttribute('style');
          }
          else if (node.children.length > 0) {
            traverse(node);
          }
          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('sanitize', function (html) {

        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});

define('strip-bold-in-headings',['scribe-common/src/element'], function (scribeElement) {

  

  return function () {
    return function (scribe) {

      function traverse(parentNode) {
        var node = parentNode.firstElementChild;

        while (node) {
          if (node.nodeName === 'B' && (/^(H[1-6])$/).test(parentNode.nodeName)) {
            scribeElement.unwrap(parentNode, node);
          }
          else if (node.children.length > 0) {
            traverse(node);
          }
          node = node.nextElementSibling;
        }
      }

      scribe.registerHTMLFormatter('sanitize', function (html) {

        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin);
        return bin.innerHTML;
      });
    };
  };

});

define('scribe-plugin-anchor',[],function () {
  return function (config) {
    return function (scribe) {
      var anchorCommand = new scribe.api.Command('anchor');

      function getSlug(text) {
      	return text.toString().toLowerCase()
    			.replace(/\s+/g, '-')           // Replace spaces with -
    			.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    			.replace(/\-\-+/g, '-')
    			.trim();
      }

      anchorCommand.queryEnabled = function () {
        var selection = new scribe.api.Selection();
        var targetNode = selection.getContaining(function(node){
          return true;
        });
        return targetNode !== undefined;
      }

      anchorCommand.queryState = function (value) {
      	var selection = new scribe.api.Selection();
        var targetNode = selection.getContaining(function(node){
          return node.nodeType !== 3;
        });
        if (targetNode === undefined) {
          return false;
        }
        return !! targetNode.id
      };

      anchorCommand.execute = function () {
        var selection = new scribe.api.Selection();
        console.log(selection);
        var targetNode = selection.getContaining(function(node){
        	return node.nodeType !== 3;
        });
        console.log(targetNode);

      	scribe.transactionManager.run(function () {
        	if (targetNode.id) {
            targetNode.removeAttribute('id');
        	} else {
        		targetNode.id = getSlug(targetNode.textContent);
        	}
      	}.bind(this));
      };

      scribe.commands.toggleAnchor = anchorCommand;
    };
  }
});
define('our-ensure-selectable-containers',[
    'scribe-common/src/element',
    'lodash-amd/modern/collections/contains'
  ], function (
    element,
    contains
  ) {

  /**
   * Chrome and Firefox: All elements need to contain either text or a `<br>` to
   * remain selectable. (Unless they have a width and height explicitly set with
   * CSS(?), as per: http://jsbin.com/gulob/2/edit?html,css,js,output)
   */

  /**
   * It seems we don't want BRs inserted in html-inline elements (like I, B, A) nor
   * our "inline objects" so we allow for an optional "skipElement" function in
   * the config.
   */

  

  // http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
  var html5VoidElements = ['AREA', 'BASE', 'BR', 'COL', 'COMMAND', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR'];
  var inlineElementNames = ['A', 'B', 'DEL', 'EM', 'STRONG', 'I', 'U'];
  function nodeIsInlineElement(node) {
    return inlineElementNames.indexOf(node.nodeName) !== -1;
  }

  function traverse(parentNode, config) {
    // Instead of TreeWalker, which gets confused when the BR is added to the dom,
    // we recursively traverse the tree to look for an empty node that can have childNodes

    var node = parentNode.firstElementChild;

    function isEmpty(node) {
      return node.children.length === 0
        || (node.children.length === 1
            && element.isSelectionMarkerNode(node.children[0]));
    }

    while (node) {
      if (!element.isSelectionMarkerNode(node)) {
        // Find any node that contains no child *elements*, or just contains
        // whitespace, and is not self-closing
        // dont put BRs in inline elements, please.
        if (isEmpty(node) &&
          node.textContent.trim() === '' &&
          !contains(html5VoidElements, node.nodeName) &&
          element.isBlockElement(node)) {
          node.appendChild(document.createElement('br'));
        } else if (node.children.length > 0) {
          if (!config.skipElement || !(config.skipElement && config.skipElement(node))) {
            traverse(node, config);
          }
        }
      }
      node = node.nextElementSibling;
    }
  }

  return function (config) {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        var bin = document.createElement('div');
        bin.innerHTML = html;

        traverse(bin, config);

        return bin.innerHTML;
      });

    };
  };

});

define('enforce-p-elements',[
  'lodash-amd/modern/arrays/last',
  'scribe-common/src/element'
], function (
  last,
  element
) {

  /**
   * Chrome and Firefox: Upon pressing backspace inside of a P, the
   * browser deletes the paragraph element, leaving the caret (and any
   * content) outside of any P.
   *
   * Firefox: Erasing across multiple paragraphs, or outside of a
   * whole paragraph (e.g. by ‘Select All’) will leave content outside
   * of any P.
   *
   * Entering a new line in a pristine state state will insert
   * `<div>`s (in Chrome) or `<br>`s (in Firefox) where previously we
   * had `<p>`'s. This patches the behaviour of delete/backspace so
   * that we do not end up in a pristine state.
   */

  

  /**
   * Wrap consecutive inline elements and text nodes in a P element.
   */
  function wrapChildNodes(parentNode) {
    var groups = Array.prototype.reduce.call(parentNode.childNodes,
                                             function (accumulator, binChildNode) {
      var group = last(accumulator);
      if (! group) {
        startNewGroup();
      } else {
        var isBlockGroup = element.isBlockElement(group[0]);
        if (isBlockGroup === element.isBlockElement(binChildNode)) {
          group.push(binChildNode);
        } else {
          startNewGroup();
        }
      }

      return accumulator;

      function startNewGroup() {
        var newGroup = [binChildNode];
        accumulator.push(newGroup);
      }
    }, []);

    var consecutiveInlineElementsAndTextNodes = groups.filter(function (group) {
      var isBlockGroup = element.isBlockElement(group[0]);
      return ! isBlockGroup;
    });

    consecutiveInlineElementsAndTextNodes.forEach(function (nodes) {
      var pElement = document.createElement('p');
      nodes[0].parentNode.insertBefore(pElement, nodes[0]);
      nodes.forEach(function (node) {
        pElement.appendChild(node);
      });
    });

    parentNode._isWrapped = true;
  }

  // Traverse the tree, wrapping child nodes as we go.
  function traverse(parentNode) {
    var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
    var node = treeWalker.firstChild();

    // FIXME: does this recurse down?

    while (node) {
      // TODO: At the moment we only support BLOCKQUOTEs. See failing
      // tests.
      if (node.nodeName === 'BLOCKQUOTE' && ! node._isWrapped) {
        wrapChildNodes(node);
        traverse(parentNode);
        break;
      }
      node = treeWalker.nextSibling();
    }
  }

  return function () {
    return function (scribe) {

      scribe.registerHTMLFormatter('normalize', function (html) {
        /**
         * Ensure P mode.
         *
         * Wrap any orphan text nodes in a P element.
         */
        // TODO: This should be configurable and also correct markup such as
        // `<ul>1</ul>` to <ul><li>2</li></ul>`. See skipped tests.
        // TODO: This should probably be a part of HTML Janitor, or some other
        // formatter.
        var bin = document.createElement('div');
        bin.innerHTML = html;

        wrapChildNodes(bin);
        traverse(bin);

        return bin.innerHTML;
      });

    };
  };

});

define('onion-editor',[
  'scribe',
  'scribe-plugin-blockquote-command',
  'scribe-plugin-curly-quotes',
  'scribe-plugin-formatter-plain-text-convert-new-lines-to-html',
  'scribe-plugin-heading-command',
  'scribe-plugin-intelligent-unlink-command',
  'scribe-plugin-keyboard-shortcuts',
  'scribe-plugin-link-ui',
  'scribe-plugin-sanitizer',
  'scribe-plugin-smart-lists',
  'scribe-plugin-toolbar',
  'scribe-plugin-inline-objects',
  'scribe-plugin-betty-cropper',
  'scribe-plugin-youtube',
  'scribe-plugin-embed',
  'scribe-plugin-onion-video',
  'scribe-plugin-hr',
  'scribe-plugin-placeholder',
  'link-formatter',
  'only-trailing-brs',
  'paste-strip-newlines',
  'paste-strip-nbsps',
  'paste-from-word',
  'paste-sanitize',
  'remove-a-styles',
  'strip-bold-in-headings',
  'scribe-plugin-anchor',
  // scribe core
  'our-ensure-selectable-containers',
  'enforce-p-elements'
], function (
  Scribe,
  scribePluginBlockquoteCommand,
  scribePluginCurlyQuotes,
  scribePluginFormatterPlainTextConvertNewLinesToHtml,
  scribePluginHeadingCommand,
  scribePluginIntelligentUnlinkCommand,
  scribePluginKeyboardShortcuts,
  scribePluginLinkUI,
  scribePluginSanitizer,
  scribePluginSmartLists,
  scribePluginToolbar,
  scribePluginInlineObjects,
  scribePluginBettyCropper,
  scribePluginYoutube,
  scribePluginEmbed,
  scribePluginOnionVideo,
  scribePluginHr,
  scribePluginPlaceholder,
  linkFormatter,
  onlyTrailingBrs,
  pasteStripNewlines,
  pasteStripNbsps,
  pasteFromWord,
  pasteSanitize,
  removeAStyles,
  stripBoldInHeadings,
  scribePluginAnchor,
  // scribe core
  ourEnsureSelectableContainers,
  enforcePElements
) {

  

  var defaults = {
    multiline: true,
    formatting: ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'underline'],
    link: {
      domain: 'avclub.com'
    },
    video: {
      videoEmbedUrl: 'http://example.com?videoid=',
      insertDialog: function() {  },
      editDialog: function() {  }
    },
    image: {
      insertDialog: function() {  },
      editDialog: function() {  }
    }
  };

  function OnionEditor(element, options) {
    options = $.extend(defaults, options);
    $('.inline', element).attr('contenteditable', 'false');
  
    var scribe = new Scribe(element, { allowBlockElements: options.multiline });      

    /* if a node running through the sanitizer passes this test, it won't get sanitized true */
    function skipSanitization(node) {
      return ($(node).is('div.inline'));
    };
    // HACK: we reset the default htmlFormatters 'normalize' because
    // they don't quite work with what we're doing and there's
    // apparently no other way to override/remove the offending ones.
    scribe._htmlFormatterFactory.formatters['normalize'] = [];
    if (scribe.allowsBlockElements()) {
      scribe.use(enforcePElements());
      scribe.use(ourEnsureSelectableContainers({skipElement: skipSanitization}));
    }

    // MO' HACKZ: We don't want to kill SPANS inside our inline divs
    var insertHTMLCommandPatch = new scribe.api.CommandPatch('insertHTML');
    insertHTMLCommandPatch.execute = function (value) {
      scribe.transactionManager.run(function () {
        scribe.api.CommandPatch.prototype.execute.call(this, value);

        sanitize(scribe.el);

        function sanitize(parentNode) {
          var treeWalker = document.createTreeWalker(parentNode, NodeFilter.SHOW_ELEMENT);
          var node = treeWalker.firstChild();
          if (!node) { return; }

          do {
            if (node.nodeName === 'SPAN' && node.className.indexOf('inline') === -1) {
              element.unwrap(parentNode, node);
            } else {
              /**
               * If the list item contains inline elements such as
               * A, B, or I, Chrome will also append an inline style for
               * `line-height` on those elements, so we remove it here.
               */
              node.style.lineHeight = null;

              // There probably wasn’t a `style` attribute before, so
              // remove it if it is now empty.
              if (node.getAttribute('style') === '') {
                node.removeAttribute('style');
              }
            }

            // Sanitize children
            sanitize(node);
          } while ((node = treeWalker.nextSibling()));
        }
      }.bind(this));
    };
    scribe.commandPatches.insertHTML = insertHTMLCommandPatch;

    // ENDHACK

    if (options.placeholder) {
      scribe.use(scribePluginPlaceholder(options.placeholder));
    }

    // For now, we need to patch some scribe commands, just in case.
    var boldCommand = new scribe.api.CommandPatch('bold');
    boldCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['bold'] = boldCommand;

    var italicCommand = new scribe.api.CommandPatch('italic');
    italicCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['italic'] = italicCommand;
    
    var underlineCommand = new scribe.api.CommandPatch('underline');
    underlineCommand.execute = function (value) {
      if (this.selection === undefined) {
        document.execCommand(this.commandName, false, value || null);
      } else {
        scribe.transactionManager.run(function () {
          document.execCommand(this.commandName, false, value || null);
        }.bind(this));
      }
    };
    scribe.commandPatches['underline'] = underlineCommand;
    // End horrible patches

    var keyCommands = {};
    var ctrlKey = function (event) { return event.metaKey || event.ctrlKey; };

    // Allowable Tags
    var tags = {};
    
    // Multiline
    if (options.multiline) {
      tags.p = {'id': true};
      tags.br = {};
      tags.hr = {};
    } else {
      // tags.br = {};
      // scribe.use(onlyTrailingBrs());
    }

    // Bold
    if (options.formatting.indexOf('bold') !== -1) {
      keyCommands.bold = function (event) { return event.metaKey && event.keyCode === 66; }; // b
      tags.b = {'id': true};
    }

    // Italics
    if (options.formatting.indexOf('italic') !== -1) {
      keyCommands.italic = function (event) { return event.metaKey && event.keyCode === 73; }; // i
      tags.i = {'id': true};
      tags.em = {'id': true};
    }

    // Strike
    if (options.formatting.indexOf('strike') !== -1) {
      keyCommands.strikeThrough = function (event) { return event.altKey && event.shiftKey && event.keyCode === 83; }; // s
      tags.s = {'id': true};
    }

    // Underline 
    if (options.formatting.indexOf('underline') !== -1) {
      keyCommands.underline = function (event) { return event.metaKey && event.keyCode === 85; }; // u
      tags.u = {'id': true};
    }

    // Remove formatting... 
    keyCommands.removeFormat = function (event) { return event.altKey && event.shiftKey && event.keyCode === 65; }; // a

    // Links
    if (options.multiline && options.formatting.indexOf('link') !== -1) {
      keyCommands.linkUI = function (event) { return event.metaKey && ! event.shiftKey && event.keyCode === 75; }; // k
      keyCommands.unlink = function (event) { return event.metaKey && event.shiftKey && event.keyCode === 75; }; // k,
      scribe.use(scribePluginIntelligentUnlinkCommand());
      scribe.use(scribePluginLinkUI(options.link));
      scribe.use(linkFormatter(options.link));
      tags.a = { href:true, target:true, id:true};
    }

    // Lists
    if (options.multiline && options.formatting.indexOf('list') !== -1) {
      keyCommands.insertUnorderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 66; }; // b
      keyCommands.insertOrderedList = function (event) { return event.altKey && event.shiftKey && event.keyCode === 78; }; // n
      
      scribe.use(scribePluginSmartLists());
      tags.ol = {id:true};
      tags.ul = {id:true};
      tags.li = {id:true};
    }

    //Blockquotes
    if (options.multiline && options.formatting.indexOf('blockquote') !== -1) {
      keyCommands.blockquote = function (event) { return event.altKey && event.shiftKey && event.keyCode === 87; }; // w
      scribe.use(scribePluginBlockquoteCommand());
      tags.blockquote = {id:true};
    }

    // Headings
    if (options.multiline && options.formatting.indexOf('heading') !== -1) {
      keyCommands.h3 = function (event) { return ctrlKey(event) && event.keyCode === 50; }; // 2
      keyCommands.h4 = function (event) { return ctrlKey(event) && event.keyCode === 51; }; // 2
      scribe.use(scribePluginHeadingCommand(3));
      scribe.use(scribePluginHeadingCommand(4));
      tags.h3 = {id:true};
      tags.h4 = {id:true};
    }


    // Inline Objects
    if (options.multiline && options.inlineObjects) {
      scribe.use(scribePluginInlineObjects(options.inlineObjects));
      
      // Maybe make optionally load these similar to formatting. For now, it's an all or nothing.

      scribe.use(scribePluginBettyCropper(options.image));
      scribe.use(scribePluginYoutube());
      scribe.use(scribePluginEmbed());
      scribe.use(scribePluginHr());
      scribe.use(scribePluginAnchor());
      scribe.use(scribePluginOnionVideo(options.video));
      scribe.use(removeAStyles());
      scribe.use(stripBoldInHeadings());
    }

    scribe.use(scribePluginSanitizer({
      tags: tags,
      skipSanitization: skipSanitization
    }));
    scribe.use(pasteFromWord());
    scribe.use(pasteSanitize());
    scribe.use(pasteStripNewlines());
    scribe.use(pasteStripNbsps());
    // Word count 
    
    if (options.statsContainer) {
      setInterval(function () {
        $(options.statsContainer).html(
          $(scribe.el).text().split(' ').length
        );
      }, 3000);
    }


    /* This is necessary for a few dumb reasons. Scribe's transaction manager doesn't work when there 
      ins't a selection inside of the editor. This means any changes made when the editor ins't in focus,
      like adding an image, stuff breaks. This works around that particular issue. 

      I'm not really sure the right way to fix this or how to avoid this problem.

      The scroll stuff is a consequence of this. 
    */
    scribe.updateContents = function(fn, skipFormatters) {
      // Default is to skipFormatters. Only place this needs to be set to false is when updating links. 
      // We want formatters to run on links. Embeds & other shit seem to get sanitized 
      // despite there being safegaurds for that.
      if (typeof skipFormatters === 'undefined') {
        skipFormatters = true;
      }
      scribe._skipFormatters = skipFormatters;
      var scrollY = window.scrollY;
      setTimeout(function() {        
        scribe.el.focus();
        setTimeout(function() {
          scribe.transactionManager.run(fn);
          window.scrollTo(0, scrollY);

          // This should notify any changes that happen outside of typing 
          scribe.trigger('content-changed');
        }, 20);
      }, 20);
    };
    
    scribe.use(scribePluginCurlyQuotes());
    scribe.use(scribePluginKeyboardShortcuts(Object.freeze(keyCommands)));

    //TODO: kill this existing toolbar & replace w/ Medium style selection toolbar
    if (options.multiline) {
      scribe.use(scribePluginToolbar($('.document-tools .toolbar-contents', element.parentNode)[0]));
    }
    else {
      $('.document-tools .toolbar-contents', element.parentNode).hide();
    }

    // a little hacky to prevent deletion of images and other inline elements via the backspace key. 
    scribe.el.addEventListener('keydown', function(event) {
      if (event.keyCode === 8) {
        // is the previous immediate child of editor an inline item?
        var sel = new scribe.api.Selection();
        var prev = $(sel.selection.anchorNode).closest('.editor>*').prev();
        if (prev.hasClass('inline') 
          && sel.selection.anchorOffset === 0 
          && sel.selection.isCollapsed) {
          event.preventDefault();
        }
      }
    });

    scribe.use(scribePluginFormatterPlainTextConvertNewLinesToHtml());

    this.setChangeHandler = function(func) {
      scribe.on('content-changed', func); 
    };

    this.setContent = function(content) {
      if (!content) {
          content = '<p><br></p>';
      }
      scribe.setContent(content);
    };

    this.getContent = function() {
      //todo: if multiline is false, only return contents of the paragraph

      var contents = scribe.getContent();

      // Allow any plugins to clean up markup. Main use case is for embed plugin, atm.
      return contents;
    };

    this.scribe = scribe;
    return this;
  } 

  return OnionEditor;

});

  // wrap-end.frag
  return require('onion-editor');
}));