'use strict';
/*

Image

This bridges the embed module that the editor exposes & our custom image implementation.

*/


/* prevents backspace from accidentally triggering a back event */

$(document).unbind('keydown').bind('keydown', function (event) {
  var doPrevent = false;
  if (event.keyCode === 8) {
    var d = event.srcElement || event.target;
    if (['TEXTAREA', 'INPUT'].indexOf(d.tagName.toUpperCase() !==  -1)) {
      doPrevent = d.readOnly || d.disabled;
    }
    //we're in a content editable field
    else if (d.isContentEditable) {
      doPrevent = false;
    } else {
      doPrevent = true;
    }
  }
  if (doPrevent) {
    event.preventDefault();
  }
});
