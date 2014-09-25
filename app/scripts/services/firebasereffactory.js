'use strict';

/**
 * Factory for creating new references to firebase.
 */
angular.module('bulbsCmsApp')
  .service('FirebaseRefFactory', function () {

    return {
      newRef: function (url) {
        return new Firebase(url);
      }
    };

  });