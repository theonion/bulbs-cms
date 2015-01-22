'use strict';

angular.module('promotedContentSearch.controller', [
  'promotedContent.service'
])
  .controller('PromotedContentSearch', function (_, moment, $scope, $location, PromotedContentService) {

    $scope.pzoneData = PromotedContentService.getData();
    $scope.pageNumber = $location.search().page || '1';

    $scope.goToPage = function () {
      PromotedContentService.$refreshAllContent({page: $scope.pageNumber}, true);
    };

    $scope.articleIsVisible = function (article) {
      var inPZone =
        $scope.pzoneData.selectedPZone &&
        _.find($scope.pzoneData.selectedPZone.content, {id: article.id});
      return inPZone ? true : false;
    };

    /**
    * Check if an article is draggble. Dragging is allowed if preview time is
    *  set to immediate and the article is already published, or if a preview
    *  time is set into the future and the article will be published before that.
    *
    * @param {object} article - article to test for draggability.
    * @returns {Boolean} true if article is draggable, false otherwise.
    */
    $scope.articleIsDraggable = function (article) {
      var immediateDraggable =
        ($scope.pzoneData.previewTime === null &&
          moment().isAfter(article.published));
      var futureDraggable =
        ($scope.pzoneData.previewTime !== null &&
          moment().isBefore($scope.pzoneData.previewTime) &&
          $scope.pzoneData.previewTime.isAfter(article.published));

      return immediateDraggable || futureDraggable;
    };

    $scope.contentPickedUp = function (e) {
      PromotedContentService.pickupContentFromAll(e.target);
    };

    $scope.contentDropped = function () {
      PromotedContentService.dropContent();
    };

  });
