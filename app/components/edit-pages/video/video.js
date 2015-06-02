'use strict';

angular.module('content.video', [
  'content',
  'videoSearch'
])
  .directive('contentVideo', [
    'COMPONENTS_URL',
    function (COMPONENTS_URL) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: COMPONENTS_URL + 'edit-pages/video/video.html'
      };
    }
  ]);
