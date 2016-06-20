'use strict';

angular.module('promotedContentArticle.directive', [
  'bulbs.cms.site.config'
])
  .directive('promotedContentArticle', function (CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: CmsConfig.buildComponentPath('promoted-content/promoted-content-article/promoted-content-article.html')
    };
  });
