/**
 * Releases via github.
 */
'use strict';

module.exports = {
  options: {
    file: 'bower.json',
    npm: false,
    tagMessage: '<%= version %>',
    branch: 'release',
    github: {
      repo: 'theonion/bulbs-cms',
      usernameVar: 'GITHUB_USERNAME',
      passwordVar: 'GITHUB_TOKEN'
    }
  }
};
