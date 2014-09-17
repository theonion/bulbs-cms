'use strict';

/**
 * Service for authenticating and interacting with the root of this site in firebase.
 */
angular.module('bulbsCmsApp')
  .value('FIREBASE_URL', 'https://luminous-fire-8340.firebaseio.com/')
  .value('FIREBASE_ROOT', 'a-site-is-not-configured')
  .factory('FirebaseApi', function ($firebase, $q, CurrentUser, FIREBASE_URL, FIREBASE_ROOT) {

    // get root reference in firebase for this site
    var rootRef = new Firebase(FIREBASE_URL + 'sites/' + FIREBASE_ROOT);

    // set up a promise for authorization
    var authDefer = $q.defer(),
        $authorize = authDefer.promise;

    // set up catch all for logging auth errors
    $authorize.catch(function (error) {

      // if there's an error message log it
      error && console.error('Firebase login failed:', error);

    });

    // log current session in when their current user data is available
    CurrentUser.$retrieveData.then(function (user) {

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

    // ensure session is unauthed when they disconnect
    var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
    connectedRef.on('value', function (connected) {

      if (!connected.val()) {

        // user is no longer connected, unauthorize them from the server
        rootRef.unauth();

      }

    });

    return {

      /**
       * Authorization deferred promise that resolves with the root firebase reference, or rejects with an error
       *  message.
       */
      $authorize: $authorize

    };

  });

