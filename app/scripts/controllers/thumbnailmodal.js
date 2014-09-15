'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance) {

    // decide what temporary thumbnail to display
    $scope.thumbnail_temp = $scope.article.thumbnail_override && $scope.article.thumbnail_override.id
                              ? $scope.article.thumbnail_override : $scope.article.thumbnail;

    /**
     * Upload a new image to BettyCropper and set the scope's thumbnail_temp to that new image.
     */
    $scope.selectCustomThumbnail = function () {

      // allow user to choose a custom thumbnail
      BettyCropper.upload().then(
        function (success) {
          $scope.thumbnail_temp = {
            id: success.id,
            caption: null,
            alt: null
          };
        },
        function (error) {
          console.log(error);
        },
        function (progress) {
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
      if (($scope.thumbnail_temp && !$scope.article.thumbnail)
          || ($scope.article.thumbnail && $scope.thumbnail_temp.id !== $scope.article.thumbnail.id)) {
        // here user has chosen a new override, close it with actual thumbnail data
        $modalInstance.close($scope.thumbnail_temp);
      } else {
        // here user has not chosen any new thumbnail data, close it with no data
        $modalInstance.close(null);
      }

    };

  });
