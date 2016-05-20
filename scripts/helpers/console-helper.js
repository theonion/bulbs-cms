/**
 * Console utilties for other helper scripts.
 */

'use strict';

module.exports = {
  /**
   * Log an error to console and exit the process with error code 1.
   *
   * @param {...} arguments to pass to console.error.
   */
  exitWithError: function () {
    console.error(arguments);
    process.exit(1);
  }
};
