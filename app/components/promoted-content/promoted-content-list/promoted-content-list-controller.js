'use strict';

angular.module('promotedContentList.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentList', function ($scope, PromotedContentService) {

      $scope.pzoneData = PromotedContentService.getData();

      $scope.contentDroppedIntoZone = function (e) {
        $scope.destyleDropZones();
        PromotedContentService.$dropAndAddContent(e.target);
      };

      $scope.contentDroppedIntoReplaceZone = function (e) {
        $scope.destyleDropZones();
        PromotedContentService.$dropAndAddContent(e.target, true);
      };

      $scope.moveUp = function (index) {
        PromotedContentService.moveContentUp(index);
      };

      $scope.moveDown = function (index) {
        PromotedContentService.moveContentDn(index);
      };
  });
