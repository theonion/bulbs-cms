'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (routes, CurrentUser, CmsConfig) {
    return {
      controller: function ($scope) {
        $scope.current_user = CurrentUser;
        $scope.logout = CmsConfig.logoutCallback;
      },
      restrict: 'E',
      replace: true,
      templateUrl: routes.PARTIALS_URL + 'logged-in-user.html',
      scope: {}
    };
  });
