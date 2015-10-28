'use strict';

angular.module('copyButton', [])
  .directive('copyButton', function (SHARED_URL) {
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
        content: '@'
      },
      templateUrl: SHARED_URL + 'copy-button/copy-button.html'
    };
  });
