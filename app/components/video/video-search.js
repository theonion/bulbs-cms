'use strict';

angular.module('bulbs.cms.video.videoSearch', [
  'bulbs.cms.site.config',
  'lodash',
  'VideohubClient.api',
  'VideohubClient.settings',
  'uuid4'
])
  .directive('videoSearch', [
    '_', 'CmsConfig', 'uuid4',
    function (_, CmsConfig, uuid4) {
      return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl: CmsConfig.buildComponentPath('video/video-search.html'),
        scope: {
          label: '@videoSearchLabel',
          onSelect: '&videoSearchLabel'
        },
        controller: [
          '$scope', 'Video', 'VIDEOHUB_DEFAULT_CHANNEL',
          function ($scope, Video, VIDEOHUB_DEFAULT_CHANNEL) {
            $scope.videoChannel = VIDEOHUB_DEFAULT_CHANNEL;

            $scope.itemDisplayFormatter = function (video) {
              if (_.isObject(video)) {
                return video.id + ' - ' + video.title;
              }
            };

            $scope.searchVideos = function (query) {
              return Video.$postSearch({
                query: query,
                channel: VIDEOHUB_DEFAULT_CHANNEL
              });
            };
          }
        ],
        link: function (scope, elements, attrs, ngModelCtrl) {
          scope.uuid = uuid4.generate();

          if (ngModelCtrl) {
            scope.ngModel = ngModelCtrl;

            ngModelCtrl.$render = function () {
              if (_.has(ngModelCtrl.$modelValue, 'title') && !scope.initialValue) {
                scope.initialValue = scope.itemDisplayFormatter(ngModelCtrl.$modelValue);
              }
            };

            scope.onSelect = function (selection) {
              ngModelCtrl.$commitViewValue();
            };
          }
        }
      };
    }
  ]);
