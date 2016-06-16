'use strict';

angular.module('bulbsCmsApp')
  .directive('videoEmbed', function (CmsConfig) {
    return {
      template: '<div class="video-embed"><iframe src="{{videoUrl}}"></iframe></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.videoUrl = CmsConfig.buildVideoUrl(attrs.videoId);
      }
    };
  });
