'use strict';

/**
 * Mock Firebase API, configurable to authorize or not authorize via the hasFirebase flag.
 */
angular.module('bulbsCmsApp.mockApi')
  .factory('FirebaseRefFactory', function () {

    return {
      newRef: function (url) {
        return new MockFirebase(url);
      }
    };

  });