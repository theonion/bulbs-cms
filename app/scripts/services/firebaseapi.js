'use strict';

angular.module('bulbsCmsApp')
  .value('FIREBASE_URL', 'https://luminous-fire-8340.firebaseio.com/')
  .value('FIREBASE_ROOT', 'a-site-is-not-configured')
  .factory('FirebaseApi', function ($firebase, $q, CurrentUser, FIREBASE_URL, FIREBASE_ROOT) {

    // get root reference in firebase for this site
    var rootRef = new Firebase(FIREBASE_URL + 'sites/' + FIREBASE_ROOT);

    // set up a promise for authorization, never resolves if user doesn't have firebase token
    var authDefer = $q.defer(),
        $authorize = authDefer.promise;

    // set up catch all for logging auth errors
    $authorize.catch(function (error) {

      // error occurred, say why
      console.error(error);

    });

    // long current user in when their data is available
    CurrentUser.$retrieveData.then(function (user) {

      // attempt to login if user has firebase token, if they don't auth promise will not resolve which is okay if
        //  we're in an environment where firebase isn't set up yet
        if ('firebase_token' in user && user.firebase_token) {

          // authorize user
          rootRef.auth(user.firebase_token, function (error) {

            if (error) {

              // authorization failed
              authDefer.reject('Firebase login failed: ' + error);

            } else {

              // authorization success, resolve deferred authorization
              authDefer.resolve();

            }

          });

        }

    });

    // ensure user is unauthed when they disconnect
    var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
    connectedRef.on('value', function (connected) {

      if (!connected.val()) {

        // user is no longer connected, unauthorize them from the server
        rootRef.unauth();

      }

    });

    return {

      $retrieveActiveUsers: function (articleId) {

        return $authorize.then(function () {

          return $firebase(rootRef.child('articles/' + articleId + '/users')).$asArray();

        });

      },

      registerCurrentUserActive: function ($activeUsers) {

        var displayName = CurrentUser.data.first_name && CurrentUser.data.last_name
                            ? CurrentUser.data.first_name + ' ' + CurrentUser.data.last_name
                              : (CurrentUser.data.email || CurrentUser.data.username);

        return $activeUsers
          .$add({
            id: CurrentUser.data.id,
            displayName: displayName
          })
          .then(function (userRef) {

            // ensure user is removed on disconnect
            userRef.onDisconnect().remove();
            return userRef;

          });

      }

    };

  });

