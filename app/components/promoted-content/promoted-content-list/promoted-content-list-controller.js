'use strict';

angular.module('promotedContentList.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentList', function ($scope, PromotedContentService) {

      $scope.pzoneData = PromotedContentService.getData();

      $scope.moveUp = function (index) {
        PromotedContentService.moveContentUp(index);
      };

      $scope.moveDown = function (index) {
        PromotedContentService.moveContentDn(index);
      };

      $scope.remove = function (article) {
        PromotedContentService.$removeContentFromPZone(article.id);
      };

      $scope.markDirty = function () {
        PromotedContentService.markDirtySelectedPZone();
      };

  });
