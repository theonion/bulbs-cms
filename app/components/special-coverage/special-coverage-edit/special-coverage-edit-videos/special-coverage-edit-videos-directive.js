'use strict';

angular.module('specialCoverage.edit.videos.directive', [
  'specialCoverage.edit.videos.video.directive',
  'ui.sortable',
  'utils'
])
  .directive('specialCoverageEditVideos', function (routes) {
    return {
      controller: function (_, $scope, Utils) {

        $scope.moveUp = function (index) {
          Utils.moveTo($scope.videos, index, index - 1);
          $scope.onUpdate();
        };

        $scope.moveDown = function (index) {
          Utils.moveTo($scope.videos, index, index + 1);
          $scope.onUpdate();
        };

        $scope.delete = function (index) {
          Utils.removeFrom($scope.videos, index);
          $scope.onUpdate();
        };

        $scope.addVideo = function (video) {
          $scope.addVideoCallback({video: video});
          $scope.onUpdate();
        };

      },
      restrict: 'E',
      scope: {
        addVideoCallback: '&addVideo',
        videos: '=',
        onUpdate: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit-videos/special-coverage-edit-videos.html'
    };
  });
