'use strict';
/*

Image

This bridges the embed module that the editor exposes & our custom image implementation.

*/


/* prevents backspace from accidentally triggering a back event */

// TODO : fix this at some point so we don't use global $
/* global $ */

$(document).unbind('keydown').bind('keydown', function (event) {
  var doPrevent = false;
  if (event.keyCode === 8) {
    var d = event.srcElement || event.target;
    if (['TEXTAREA', 'INPUT'].indexOf(d.tagName.toUpperCase() !==  -1)) {
      doPrevent = d.readOnly || d.disabled;
    } else if (d.isContentEditable) {
      //we're in a content editable field
      doPrevent = false;
    } else {
      doPrevent = true;
    }
  }
  if (doPrevent) {
    event.preventDefault();
  }
});
