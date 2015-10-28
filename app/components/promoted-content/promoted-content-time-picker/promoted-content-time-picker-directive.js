'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentTimePicker', function (COMPONENTS_URL) {
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

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-time-picker/promoted-content-time-picker.html'
    };
  });
