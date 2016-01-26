'use strict';

angular.module('copyButton', [])
  .directive('copyButton', function (routes) {
    return {
      controller: function ($scope, $timeout) {

        $scope.okCopy = false;
        $scope.okCopyButton = function () {
          $scope.okCopy = true;
          $timeout(function () {
            $scope.okCopy = false;
          }, 1000);
        };
      },
      restrict: 'E',
      scope: {
        buttonClassesDefault: '@',
        buttonClassesSuccess: '@',
        buttonText: '@',
        content: '@'
      },
      templateUrl: routes.SHARED_URL + 'copy-button/copy-button.html'
    };
  });
