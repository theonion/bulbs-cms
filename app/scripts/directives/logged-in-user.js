'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (PARTIALS_URL, CurrentUser, CmsConfig) {
    return {
      controller: function ($scope) {
        CurrentUser.$simplified().then(function (user) {
          $scope.user = user;
        });
        $scope.logout = CmsConfig.logoutCallback;
      },
      restrict: 'E',
      replace: true,
      templateUrl: PARTIALS_URL + 'logged-in-user.html',
      scope: {}
    };
  });
