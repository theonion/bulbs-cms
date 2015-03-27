'use strict';

angular.module('specialCoverage.edit.videos.video.directive', [
  'bulbsCmsApp.settings'
])
  .directive('specialCoverageEditVideosVideo', function (routes) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit-videos/special-coverage-edit-videos-video/special-coverage-edit-videos-video.html'
    };
  });
