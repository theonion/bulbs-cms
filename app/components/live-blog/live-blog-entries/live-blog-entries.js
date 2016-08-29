'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.site.config'
])
  .directive('liveBlogEntries', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-entries',
          'live-blog-entries.html'
        )
      };
    }
  ]);
