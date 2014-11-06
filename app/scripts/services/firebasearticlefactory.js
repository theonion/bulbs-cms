'use strict';

/**
 * Factory for getting references to articles as they are stored in firebase.
 */
angular.module('bulbsCmsApp')
  .value('FIREBASE_ARTICLE_MAX_VERSIONS', 25)
  .factory('FirebaseArticleFactory', function ($q, $firebase, $routeParams, _, moment,
                                               FirebaseApi, CurrentUser, FIREBASE_ARTICLE_MAX_VERSIONS) {

    /**
     * Create a new article.
     *
     * @param rootRef     root reference of firebase db.
     * @param articleId   id of article to create.
     * @return  article object.
     */
    var createArticle = function (rootRef, articleId) {

      var articleRef = rootRef.child('articles/' + articleId),
          $activeUsers = $firebase(articleRef.child('users')).$asArray(),
          $versions = $firebase(articleRef.child('versions')).$asArray();

      var addCurrentUserToActiveUsers = function () {

        var registeredDeferred = $q.defer(),
            registeredPromise = registeredDeferred.promise;

        CurrentUser.$simplified()
          .then(function (user) {

            $activeUsers
              .$add(user)
              .then(function (userRef) {

                // ensure user is removed on disconnect
                userRef.onDisconnect().remove();

                // resolve registration
                registeredDeferred.resolve(user);

              })
              .catch(function (error) {
                registeredDeferred.reject(error);
              });

          })
          .catch(function (error) {
            registeredDeferred.reject(error);
          });

        return registeredPromise;

      };

      var registerCurrentUserActive = function () {

        // ensure when reconnection occurs, user is added back to active users
        FirebaseApi.$connection.onConnect(addCurrentUserToActiveUsers);

        // add current user and return promise
        return addCurrentUserToActiveUsers();

      };

      return {

        /**
         * Raw firebase article reference.
         */
        ref: articleRef,
        /**
         * Get angularfire live array of article's currently active users.
         */
        $activeUsers: function () { return $activeUsers; },
        /**
         * Get angularfire live array of article versions.
         */
        $versions: function () { return $versions; },
        /**
         * Register a user as active with this article.
         *
         * @returns   deferred promise that will resolve with the user reference as added to the active user list.
         */
        $registerCurrentUserActive: registerCurrentUserActive,

        /**
         * Create a new version for this article.
         *
         * @param articleData   Content to store in the version.
         * @returns   deferred promise that will resolve with the version reference as added to the versions list.
         *  Promise is rejected if for some reason create did not occur (eg nothing changed since last version).
         */
        $createVersion: function (articleData) {

          // defer for creation of version
          var createDefer = $q.defer(),
              $createPromise = createDefer.promise;

          // get simplified version of user then use that when creating version
          CurrentUser.$simplified().then(function (user) {

            // if we will have more than the max versions allowed, delete until we're one below the max
            var numVersions = $versions.length;
            if (numVersions + 1 > FIREBASE_ARTICLE_MAX_VERSIONS) {
              _.chain($versions)
                // sort oldest to newest
                .sortBy(function (version) {
                  return version.timestamp;
                })
                // remove oldest versions until we're 1 below max versions
                .every(function (version) {
                  $versions.$remove(version);
                  numVersions--;
                  return numVersions + 1 > FIREBASE_ARTICLE_MAX_VERSIONS;
                });
            }

            // make version data
            var versionData = {
              timestamp: moment().valueOf(),
              user: user,
              content: articleData
            };

            // add version to version data
            $versions.$add(versionData)
              .then(createDefer.resolve)
              .catch(createDefer.reject);

          });

          // return promise for this create
          return $createPromise;

        }

      };

    };

    return {

      /**
       * Retrieve an article object that is connected to firebase.
       *
       * @param articleId   id of article to retrieve.
       * @returns   deferred promise that will resolve with the article object.
       */
      $retrieveArticle: function (articleId) {

        var retrieveDeferred = $q.defer(),
            retrievePromise = retrieveDeferred.promise;

        FirebaseApi.$authorize()
          .then(function (rootRef) {
            retrieveDeferred.resolve(createArticle(rootRef, articleId));
          })
          .catch(function (error) {
            retrieveDeferred.reject(error);
          });

        return retrievePromise;

      },
      /**
       * Retrieve current article object that is connected to firebase.
       *
       * @returns   deferred promise that will resolve with the current article object.
       */
      $retrieveCurrentArticle: function () {

        return this.$retrieveArticle($routeParams.id);

      }

    };

  });
