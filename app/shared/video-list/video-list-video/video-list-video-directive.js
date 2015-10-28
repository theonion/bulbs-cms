'use strict';

angular.module('videoList.video.directive', [
  'bulbsCmsApp.settings',
  'filters.moment'
])
  .directive('videoListVideo', function (SHARED_URL) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: SHARED_URL + 'video-list/video-list-video/video-list-video.html'
    };
  });
