'use strict';

angular.module('bulbsCmsApp')
    .factory('FirebaseApi', function ($firebase, CurrentUser, firebaseApiConfig) {

        var ref = new Firebase(firebaseApiConfig.FIREBASE_URL);

        return {

            getUsersViewingArticle: function (articleId) {

                return $firebase(ref.child('articles/' + articleId + '/users')).$asArray();

            },

            registerCurrentUserViewingArticle: function (articleId) {

                this.getUsersViewingArticle(articleId).$add({
                    id: CurrentUser.data.id,
                    fullName: CurrentUser.data.first_name + ' ' + CurrentUser.data.last_name
                }).then(function (ref) {

                    ref.onDisconnect().remove();

                });

            },

        };

    })
    .constant('firebaseApiConfig', {
        FIREBASE_URL: 'https://luminous-fire-8340.firebaseio.com/'
    });
