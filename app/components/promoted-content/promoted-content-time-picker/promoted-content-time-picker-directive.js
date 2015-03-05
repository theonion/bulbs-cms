'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentTimePicker', function (routes) {
    return {
      controller: function (moment, $scope, PromotedContentService) {

        $scope.contentData = PromotedContentService.getData();

        $scope.setPreviewTime = function (previewTime) {
          PromotedContentService.setPreviewTime(previewTime);
        };

        $scope.setPreviewTimeToImmediate = function () {
          $scope.previewTime = null;
          PromotedContentService.setPreviewTimeToImmediate();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-time-picker/promoted-content-time-picker.html'
    };
  });
