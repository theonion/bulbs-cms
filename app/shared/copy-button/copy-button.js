'use strict';

angular.module('copyButton', [
  'bulbs.cms.site.config'
])
  .directive('copyButton', function (CmsConfig) {
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
      templateUrl: CmsConfig.buildSharedPath('copy-button/copy-button.html')
    };
  });
