v0.1.4 - Unreleased
-------------------


 * Bower: don't download package.json. Fixes browserify + jquery problem. (#65, @amelon)
 * Fix compatibility with Karma. (#75, @shaqq)
 
Internal changes:

 * Use SVG to display Travis-CI badge. (#77, @Mithgol)
 * Readme: update .inc() and .status docs (#34, @lacivert)
 * Readme: update year (#73, @rwholmes)

To do:

 * Fix Require.js support? (#64)

v0.1.3 -- March 26, 2014
------------------------

 * Remove jQuery dependency. (#28, #7, #17, @rurjur)
 * Update Readme to change year to 2014. (#73, @rwholmes)

v0.1.2 -- August 21, 2013
-------------------------

Minor update for proper [Bower] and [Component] support.

 * Add Bower support.
 * Fix Component support and use `component/jquery` as a dependency.

v0.1.1 -- August 21, 2013
-------------------------

Minor fixes.

 * Removed the busy cursor that occurs when loading.
 * Added support for IE7 to IE9. (#3, [Mark Bao])
 * Implement `trickleRate` and `trickleSpeed` options.
 * Implement the `showSpinner` option to allow removing the spinner. (#5, #9, 
     [Rahul C S])
 * Registered as a Component in Component.io.
 * Updated the Readme with better Turbolinks instructions. (#8)

v0.1.0 -- August 20, 2013
-------------------------

Initial release.

[Rahul C S]: https://github.com/rahulcs
[Mark Bao]: https://github.com/markbao
[Bower]: http://bower.io
[Component]: http://component.io
