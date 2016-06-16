'use strict';

angular.module('videoList.video.directive', [
  'bulbs.cms.site.config',
  'filters.moment'
])
  .directive('videoListVideo', function (CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: CmsConfig.buildSharedPath('video-list/video-list-video/video-list-video.html')
    };
  });
