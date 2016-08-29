'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.site.config',
  'confirmationModal'
])
  .directive('liveBlogEntries', [
    'CmsConfig',
    function (CmsConfig) {
      return {
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
