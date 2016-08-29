'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.site.config',
  'confirmationModal',
  'OnionEditor'
])
  .directive('liveBlogEntries', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope) {
        },
        scope: {
          entries: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-entries',
          'live-blog-entries.html'
        )
      };
    }
  ]);
