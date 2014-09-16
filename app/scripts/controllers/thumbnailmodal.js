'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance, article) {

    $scope.article = article;

    // keep track of the kinds of thumbnails we have
    $scope.hasOverride = $scope.article.thumbnail_override && $scope.article.thumbnail_override.id !== null;
    $scope.hasDefault = $scope.article.thumbnail && $scope.article.thumbnail !== null;

    /**
     * Upload a new image to BettyCropper and set the scope's thumbnailTemp to that new image.
     */
    $scope.selectCustomThumbnail = function () {

      // user is choosing a custom thumbnail
      BettyCropper.upload().then(function (success) {

          $scope.article.thumbnail_override = {
            id: success.id,
            caption: null,
            alt: null
          };

          $scope.hasOverride = $scope.article.thumbnail_override
                                && $scope.article.thumbnail_override.id !== null;

        }, function (error) {
          console.log(error);
        }, function (progress) {
          console.log(progress);
        }
      );

    };

  });
