'use strict';

angular.module('promotedContentTimePicker.controller', [
  'moment',
  'promotedContent.service'
])
  .controller('PromotedContentTimePicker', function (moment, $scope, PromotedContentService) {

    $scope.contentData = PromotedContentService.getData();
    $scope.previewTime = null;

    $scope.setPreviewTime = function (previewTime) {
      PromotedContentService.setPreviewTime(previewTime);
    };

    $scope.setPreviewTimeToImmediate = function () {
      $scope.previewTime = null;
      PromotedContentService.setPreviewTimeToImmediate();
    };

  });
