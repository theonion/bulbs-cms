'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (CurrentUser) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: '/views/logged-in-user.html',
      scope: {},
      link: function (scope, element, attrs) {
        scope.current_user = CurrentUser;
      }
    };
  });
