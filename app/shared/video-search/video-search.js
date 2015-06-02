'use strict';

angular.module('videoSearch', [
  'autocompleteBasic',
  'VideohubClient.api',
  'VideohubClient.settings'
])
  .directive('videoSearch', [
    'SHARED_URL',
    function (SHARED_URL) {
      return {
        restrict: 'E',
        templateUrl: SHARED_URL + 'video-search/video-search.html',
        scope: {
          video: '='
        },
        controller: [
          '$scope', 'Video', 'VIDEOHUB_DEFAULT_CHANNEL',
          function ($scope, Video, VIDEOHUB_DEFAULT_CHANNEL) {
            $scope.videoChannel = VIDEOHUB_DEFAULT_CHANNEL;
            $scope.searchVideos = function (query) {
              return Video.$postSearch({
                query: query,
                channel: VIDEOHUB_DEFAULT_CHANNEL
              });
            };
          }
        ]
      };
    }
  ]);
