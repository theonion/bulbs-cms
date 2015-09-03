'use strict';

/**
 * Factory for creating new references to firebase.
 */
angular.module('cms.firebase.refFactory', [
  'firebase'
])
  .service('FirebaseRefFactory', [
    'Firebase',
    function (Firebase) {

      return {
        newRef: function (url) {
          return new Firebase(url);
        }
      };
    }
  ]);
