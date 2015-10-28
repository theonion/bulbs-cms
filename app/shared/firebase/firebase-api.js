'use strict';

/**
 * Service for authenticating and interacting with the root of this site in firebase.
 */
angular.module('cms.firebase.api', [
  'cms.firebase.config',
  'cms.firebase.refFactory',
  'currentUser'
])
  .service('FirebaseApi', [
    '$q', '$rootScope', 'CurrentUser', 'FirebaseConfig', 'FirebaseRefFactory',
    function ($q, $rootScope, CurrentUser, FirebaseConfig, FirebaseRefFactory) {

      // get root reference in firebase for this site
      var rootRef;
      var connectedRef;
      try {
        rootRef = FirebaseRefFactory.newRef(FirebaseConfig.getSiteDbUrl());
        connectedRef = FirebaseRefFactory.newRef(FirebaseConfig.getConnectionStatusUrl());
      } catch (e) {
        console.warn('Firebase url is invalid, FirebaseApi will prevent firebase from working: ' + e.message);
      }

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
      if (rootRef) {
        CurrentUser.$retrieveData().then(function (user) {
          // attempt to login if user has firebase token, if they don't auth
          //  promise will reject with no error message which is okay if we're
          //  in an environment where firebase isn't set up yet
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
      }

      // emit events when firebase reconnects or disconnects, disconnect event
      //  should not be used in place of onDisconnect function provided by
      //  firebase reference objects
      if (connectedRef) {
        connectedRef.on('value', function (connected) {
          if (connected.val()) {
            $rootScope.$emit('firebase-reconnected');
          } else {
            $rootScope.$emit('firebase-disconnected');
          }
          $rootScope.$emit('firebase-connection-state-changed');
        });
      }

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
         * Authorization deferred promise that resolves with the root firebase
         *  reference, or rejects with an error message.
         */
        $authorize: function () { return $authorize; },

        /**
         * Provides access to Firebase connection and disconnection event listeners.
         */
        $connection: $connection
      };

    }
  ]);
