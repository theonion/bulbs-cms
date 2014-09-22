'use strict';

/**
 * Factory for getting references to articles as they are stored in firebase.
 */
angular.module('bulbsCmsApp')
  .factory('FirebaseArticleFactory', function ($q, FirebaseApi, $firebase, $routeParams, CurrentUser) {

    /**
     * Register a user as active with a particular list of active users, most likely associated with an article.
     *
     * @param $activeUsers  Article's active user list.
     * @returns   deferred promise that will resolve with the user reference as added to the active user list.
     */
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

    /**
     * Create a new version in a particular versions list, most likely assoicated with an article.
     *
     * @param $versions     Article's versions list.
     * @param articleData   Content to store in the version.
     * @returns   deferred promise that will resolve with the version reference as added to the versions list. Promise
     *  is rejected if for some reason create did not occur (eg nothing changed since last version).
     */
    var createVersion = function ($versions, articleData) {

      // defer for creation of version
      var createDefer = $q.defer(),
          $createPromise = createDefer.promise;

      // make version data
      var versionData = {
        timestamp: moment().valueOf(),
        content: articleData
      };

      // add version to version data
      $versions.$add(versionData)
        .then(createDefer.resolve)
        .catch(createDefer.reject);

      return $createPromise;

    };

    return {

      /**
       * Retrieve current article object that is connected to firebase.
       *
       * @returns   deferred promise that will resolve with the current article object.
       */
      $retrieveCurrentArticle: function () {

        return this.$retrieveArticle($routeParams.id);

      },

      /**
       * Retrieve an article object that is connected to firebase.
       *
       * @param articleId   id of article to retrieve.
       * @returns   deferred promise that will resolve with the article object.
       */
      $retrieveArticle: function (articleId) {

        return FirebaseApi.$authorize.then(function (rootRef) {

          var articleRef = rootRef.child('articles/' + articleId);

          return {

            /**
             * Raw firebase article reference.
             */
            ref: articleRef,
            /**
             * Get angularfire live array of article's currently active users.
             */
            $activeUsers: $firebase(articleRef.child('users')).$asArray(),
            /**
             * Get angularfire live array of article versions. No guarantee of order.
             */
            $versions: $firebase(articleRef.child('versions')).$asArray(),
            $registerCurrentUserActive: function () { return registerActiveUser(this.$activeUsers); },
            $createVersion: function (content) { return createVersion(this.$versions, content) }

          };

        });

      }

    };

  });