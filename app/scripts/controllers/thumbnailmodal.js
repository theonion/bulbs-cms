'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance) {

    // keep track of if there is an override or not
    $scope.hasOverride = 'thumbnail_override' in $scope.article
                            && 'id' in $scope.article.thumbnail_override
                            && $scope.article.thumbnail_override.id !== null;

    // decide what temporary thumbnail to display
    $scope.thumbnailTemp = $scope.hasOverride ? $scope.article.thumbnail_override : $scope.article.thumbnail;

    // keep track of if any changes to thumbnail have been made
    $scope.thumbnailChanged = false;

    /**
     * Upload a new image to BettyCropper and set the scope's thumbnailTemp to that new image.
     */
    $scope.selectCustomThumbnail = function () {

      // allow user to choose a custom thumbnail
      BettyCropper.upload().then(function (success) {

          $scope.thumbnailTemp = {
            id: success.id,
            caption: null,
            alt: null
          };

          $scope.thumbnailChanged = true;

        }, function (error) {
          console.log(error);
        }, function (progress) {
          console.log(progress);
        }
      );

    };

    /**
     * Close the modal with whatever thumbnail data has been chosen. External controller must capture this data and
     *  decide what to do with it. Modal will close with null if no new thumbnail has been chosen.
     */
    $scope.chooseThumbnail = function () {

      // when thumbnail is chosen, close modal with thumbnail data
      if ($scope.thumbnailTemp && $scope.thumbnailTemp.id !== null
          && (!$scope.article.thumbnail || ($scope.thumbnailTemp.id !== $scope.article.thumbnail.id))) {
        // here user has chosen a new override, close it with actual thumbnail data
        $modalInstance.close($scope.thumbnailTemp);
      } else {
        // here user has not chosen any new thumbnail data, close it with no data
        $modalInstance.close(null);
      }

    };

  });
