'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance, article) {

    $scope.article = article;

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

        }, function (error) {
          console.log(error);
        }, function (progress) {
          console.log(progress);
        }
      );

    };

  });
