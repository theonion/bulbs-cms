'use strict';

angular.module('promotedContentSave.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentSave', function (routes) {
    return {
      controller: function ($scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();

        $scope.savePZone = function () {
          PromotedContentService.$saveSelectedPZone();
        };

        $scope.clearOperations = function () {
          // clear any unsaved operations
          PromotedContentService.clearUnsavedOperations();

          // refresh selected pzone
          PromotedContentService.$refreshSelectedPZone($scope.pzoneData.previewTime);
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-save/promoted-content-save.html'
    };
  });
