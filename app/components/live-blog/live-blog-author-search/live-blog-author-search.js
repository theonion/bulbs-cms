'use strict';

angular.module('bulbs.cms.liveBlog.authorSearch', [
  'bulbs.cms.site.config'
])
  .directive('liveBlogAuthorSearch', [
    'CmsConfig',
    function (CmsConfig) {

      return {
        link: function (scope) {},
        scope: {
          ngModel: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-author-search',
          'live-blog-author-search.html'
        )
      };
    }
  ]);
