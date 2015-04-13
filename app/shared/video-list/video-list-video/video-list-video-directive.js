'use strict';

angular.module('videoList.video.directive', [
  'bulbsCmsApp.settings',
  'filters.moment'
])
  .directive('videoListVideo', function (routes) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: routes.SHARED_URL + 'video-list/video-list-video/video-list-video.html'
    };
  });
