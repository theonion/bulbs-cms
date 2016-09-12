'use strict';

angular.module('hideFromRssField.directive', [
  'bulbs.cms.site.config'
])
  .directive('hideFromRssField', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath('hide-from-rss-field', 'hide-from-rss-field.html')
      };
    }
  ]);
