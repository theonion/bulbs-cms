'use strict';

angular.module('bulbsCmsApp')
    .factory('FirebaseApi', function ($firebase, CurrentUser, firebaseApiConfig) {

        var ref = new Firebase(firebaseApiConfig.FIREBASE_URL);

        return {

            /**
             * Return a firebase array of all users currently viewing a given article.
             *
             * @param articleId     ID of article to get users for.
             * @returns {*}         AngularFire $FirebaseArray object.
             */
            getActiveUsers: function (articleId) {

                return $firebase(ref.child('articles/' + articleId + '/users')).$asArray();

            },

            /**
             * Register a user as viewing given article.
             *
             * @param articleId     ID of article that user is viewing.
             */
            registerCurrentUserActive: function (articleId) {

                if ('id' in CurrentUser.data) {

                    this.getActiveUsers(articleId).$add({
                        id: CurrentUser.data.id,
                        fullName: CurrentUser.data.first_name + ' ' + CurrentUser.data.last_name
                    }).then(function (ref) {

                        // ensure user is removed once they leave this article
                        ref.onDisconnect().remove();

                    });

                }

            },

        };

    })
    .constant('firebaseApiConfig', {
        FIREBASE_URL: 'https://luminous-fire-8340.firebaseio.com/'
    });
