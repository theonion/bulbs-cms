'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (routes, CurrentUser) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: routes.PARTIALS_URL + 'logged-in-user.html',
      scope: {},
      link: function (scope, element, attrs) {
        scope.current_user = CurrentUser;
      }
    };
  });
