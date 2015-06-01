'use strict';

angular.module('promotedContentSave.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentSave', function (COMPONENTS_URL) {
    return {
      controller: function ($scope, PromotedContentService) {

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
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-save/promoted-content-save.html'
    };
  });
