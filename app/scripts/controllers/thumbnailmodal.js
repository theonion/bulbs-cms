'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance) {

    // keep track of if there is an override or not
    $scope.hasOverride = $scope.article.thumbnail_override
                            && $scope.article.thumbnail_override.id !== null;

    // decide what temporary thumbnail to display
    $scope.thumbnailTemp = {
      id: null
    };
    if ($scope.hasOverride) {
      $scope.thumbnailTemp.id = $scope.article.thumbnail_override.id;
    } else if ($scope.article.thumbnail && 'id' in $scope.article.thumbnail) {
      $scope.thumbnailTemp.id = $scope.article.thumbnail.id;
    }

    // keep track of if any changes to thumbnail have been made
    $scope.thumbnailChanged = false;

    // keep track of id for display purposes
    $scope.thumbnailTempId = $scope.thumbnailTemp.id;
    $scope.$watch($scope.thumbnailTemp, function () {
      $scope.thumbnailTempId = $scope.thumbnailTemp.id;
    });

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
     *  decide what to do with it.
     */
    $scope.chooseThumbnail = function () {

      if ($scope.thumbnailChanged && $scope.thumbnailTemp && $scope.thumbnailTemp.id !== null) {

        // user has explicitly changed the thumbnail to a new thumbnail, send thumbnail as result
        $modalInstance.close($scope.thumbnailTemp);

      } else if (!$scope.thumbnailChanged
          && (!$scope.article.thumbnail_override || $scope.article.thumbnail_override.id === null)) {

        // thumbnail not changed, and no override, return null
        $modalInstance.close(null);

      } else if ($scope.thumbnailTemp && $scope.thumbnailTemp.id === null) {

        // user has explicitly cleared the thumbnail, return empty image, this must go before the case of not changing
        $modalInstance.close({
          id: null
        });

      } else if (!$scope.thumbnailChanged
          && $scope.article.thumbnail_override && $scope.article.thumbnail_override.id !== null) {

        // user has not changed the thumbnail, but there is an override, so just send back out the override
        $modalInstance.close($scope.article.thumbnail_override);

      } else {

        // this isn't a valid state, but just return null anyways
        $modalInstance.close(null);

      }

    };

  });
