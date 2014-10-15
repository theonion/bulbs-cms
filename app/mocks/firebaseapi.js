'use strict';

/**
 * Mock Firebase API, configurable to authorize or not authorize via the hasFirebase flag.
 */
angular.module('bulbsCmsApp.mockApi')
  .factory('FirebaseApi', function ($q) {
    var $connection = {
      onConnect: function () {
        return this;
      },
      onDisconnect: function () {
        return this;
      },
      onChange: function () {
        return this;
      }
    };
    return {
      hasFirebase: false,
      $authorize: function () {
        // mock authorization with firebase
        var firebaseAvailableDefer = $q.defer(),
            $firebaseAvailable = firebaseAvailableDefer.promise;

        // use toggle to determine if we want to pretend we have firebase or not
        if (this.hasFirebase) {
          firebaseAvailableDefer.resolve();
        } else {
          firebaseAvailableDefer.reject();
        }

        return $firebaseAvailable;
      },
      $connection: $connection
    };
  });