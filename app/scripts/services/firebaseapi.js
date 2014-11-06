'use strict';

/**
 * Service for authenticating and interacting with the root of this site in firebase.
 */
angular.module('bulbsCmsApp')
  .value('FIREBASE_URL', 'https://luminous-fire-8340.firebaseio.com/')
  .value('FIREBASE_ROOT', 'a-site-is-not-configured')
  .factory('FirebaseApi', function (FirebaseRefFactory, $firebase, $rootScope, $q, CurrentUser, FIREBASE_URL,
                                    FIREBASE_ROOT) {

    // get root reference in firebase for this site
    var rootRef = FirebaseRefFactory.newRef(FIREBASE_URL + 'sites/' + FIREBASE_ROOT);

    // set up a promise for authorization
    var authDefer = $q.defer(),
        $authorize = authDefer.promise;

    // set up catch all for logging auth errors
    $authorize
      .catch(function (error) {
        // if there's an error message log it
        if (error) {
          console.error('Firebase login failed:', error);
        }
      });

    // log current session in when their current user data is available
    CurrentUser.$retrieveData().then(function (user) {

      // attempt to login if user has firebase token, if they don't auth promise will reject with no error message
      //  which is okay if we're in an environment where firebase isn't set up yet
      if ('firebase_token' in user && user.firebase_token) {

        // authorize user
        rootRef.auth(user.firebase_token, function (error) {

          if (error) {

            // authorization failed
            authDefer.reject(error);

          } else {

            // authorization success, resolve deferred authorization with rootRef
            authDefer.resolve(rootRef);

          }

        });

      } else {

        // user doesn't have a firebase token, reject authorization without an error message
        authDefer.reject();

      }

    });

    // emit events when firebase reconnects or disconnects, disconnect event should not be used in place of onDisconnect
    //  function provided by firebase reference objects
    var connectedRef = FirebaseRefFactory.newRef(FIREBASE_URL + '.info/connected');
    connectedRef.on('value', function (connected) {

      if (connected.val()) {

        $rootScope.$emit('firebase-reconnected');

      } else {

        $rootScope.$emit('firebase-disconnected');

      }

      $rootScope.$emit('firebase-connection-state-changed');

    });

    // connection object
    var $connection = {
      onConnect: function (callback) {
        $rootScope.$on('firebase-reconnected', callback);
        return $connection;
      },
      onDisconnect: function (callback) {
        $rootScope.$on('firebase-disconnected', callback);
        return $connection;
      },
      onChange: function (callback) {
        $rootScope.$on('firebase-connection-state-changed', callback);
      }
    };

    return {

      /**
       * Authorization deferred promise that resolves with the root firebase reference, or rejects with an error
       *  message.
       */
      $authorize: function () { return $authorize; },

      /**
       * Provides access to Firebase connection and disconnection event listeners.
       */
      $connection: $connection

    };

  });

