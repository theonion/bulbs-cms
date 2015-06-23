/**
 * Compiles LESS files.
 */
'ust strict';

var config = require('../config');

module.exports = {
  project_styles: {
     files: [{
       expand: true,
       flatten: true,
       cwd: config.paths.app(),
       src: [
         'styles/**/*.less',
         '!**/_*.less'
       ],
       dest: config.paths.tmp('styles'),
       ext: '.css'
     }]
   },
   font_awesome_styles: {
     files: [{
       expand: true,
       flatten: true,
       cwd: config.paths.tmp(),
       src: 'font-awesome-less/font-awesome.less',
       dest: config.paths.tmp('styles'),
       ext: '.css'
     }]
   }
};
