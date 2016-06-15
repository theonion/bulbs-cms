'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbs.cms.site.config',
  'promotedContent.service'
])
  .directive('promotedContentTimePicker', function (CmsConfig) {
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
      templateUrl: CmsConfig.buildComponentPath('promoted-content/promoted-content-time-picker/promoted-content-time-picker.html')
    };
  });
