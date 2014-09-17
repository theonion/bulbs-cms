'use strict';

angular.module('bulbsCmsApp')
  .factory('FirebaseArticleFactory', function (FirebaseApi, $firebase, CurrentUser) {

    var registerActiveUser = function ($activeUsers) {

      return CurrentUser.$retrieveData.then(function (user) {

        var displayName = user.first_name && user.last_name
                            ? user.first_name + ' ' + user.last_name
                              : (user.email || user.username);

        return $activeUsers
          .$add({
            id: user.id,
            displayName: displayName
          })
          .then(function (userRef) {

            // ensure user is removed on disconnect
            userRef.onDisconnect().remove();
            return userRef;

          });

      });

    };

    return {

      /**
       * Retrieve an article object that is connected to Firebase.
       *
       * @param articleId   id of article to retrieve.
       * @returns   deferred promise that will resolve with the article object.
       */
      $retrieveArticle: function (articleId) {

        return FirebaseApi.$authorize.then(function (rootRef) {

          var articleRef = rootRef.child('articles/' + articleId);

          return {

            ref: articleRef,
            $activeUsers: $firebase(articleRef.child('users')).$asArray(),
            $registerCurrentUserActive: function () { return registerActiveUser(this.$activeUsers); }

          };

        });

      }

    };

  });