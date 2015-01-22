'use strict';

angular.module('promotedContentSave.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentSave', function ($scope, PromotedContentService) {

    $scope.pzoneData = PromotedContentService.getData();

    $scope.savePZone = function () {
      PromotedContentService.$saveSelectedPZone();
    };

    $scope.clearOperations = function () {
      PromotedContentService.$refreshSelectedPZone($scope.pzoneData.previewTime)
        .then(function () {
          PromotedContentService.clearUnsavedOperations();
        });
    };

  });
