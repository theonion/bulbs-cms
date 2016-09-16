'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (CurrentUserApi) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/logged-in-user.html',
      scope: {},
      link: function (scope, element, attrs) {
        CurrentUserApi.getCurrentUser()
          .then(function (user) {
            scope.currentUser = user;
          });
      }
    };
  });
