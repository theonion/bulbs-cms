'use strict';

angular.module('bulbsCmsApp')
  .value('FIREBASE_URL', 'https://luminous-fire-8340.firebaseio.com/')
  .value('FIREBASE_ROOT', 'a-site-is-not-configured')
  .factory('FirebaseApi', function ($firebase, CurrentUser, FIREBASE_URL, FIREBASE_ROOT) {

    // get firebase references
    var rootRef = new Firebase(FIREBASE_URL + 'sites/' + FIREBASE_ROOT);

    // authorization utility function
    var authed = false;
    var afterAuthQueue = [];
    var authFn = function (fn, args, scope) {

      if (!authed) {

        // not authorized yet, keep track of functions to call when we are authed
        afterAuthQueue.push({
          fn: fn,
          args: args,
          scope: scope
        });

      } else {

        // we are authorized, just call the function normally
        fn.apply(scope, args);

      }

    };

    // ensure user is unauthed when they disconnect
    var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
    connectedRef.on('value', function (connected) {

      if (!connected.val()) {

        // user is no longer connected, unauthorize them from the server
        rootRef.unauth();

      }

    });

    var buildDisplayName = function () {

      // try to show first/last name, if not try email, then username
      return CurrentUser.data.first_name && CurrentUser.data.last_name
        ? CurrentUser.data.first_name + ' ' + CurrentUser.data.last_name
        : (CurrentUser.data.email || CurrentUser.data.username);

    };

    return {

      login: function () {

        // just skip this whole thing if we're already authed
        if (!authed && 'firebase_token' in CurrentUser.data && CurrentUser.data.firebase_token) {

          // authorize user
          rootRef.auth(CurrentUser.data.firebase_token, function (error) {

            if (error) {

              // authorization failed, log an error
              console.error('Firebase login failed:', error);

            } else {

              // user now authorized, call all the queued functions
              authed = true;
              for (var i = 0; i < afterAuthQueue.length; i++) {

                var param = afterAuthQueue[i];
                authFn(param.fn, param.args, param.scope);

              }

            }

          });

        }

      },

      getActiveUsers: function (articleId, callback) {

        // use auth wrapper to ensure this function succeeds
        authFn(function (callbackArg) {

          callbackArg($firebase(rootRef.child('articles/' + articleId + '/users')));

        }, [callback], this);

      },

      registerCurrentUserActive: function (articleId) {

        // get active users then add current user
        this.getActiveUsers(articleId, function (activeUsers) {

          var rawUser = {
            id: CurrentUser.data.id,
            displayName: buildDisplayName()
          };

          activeUsers.$asArray().$add(rawUser).then(function (userRef) {

            // ensure user is removed on disconnect
            userRef.onDisconnect().remove();

          });

        });

      }

    };

  });

