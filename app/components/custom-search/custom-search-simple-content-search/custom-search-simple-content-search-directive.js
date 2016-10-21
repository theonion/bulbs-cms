'use strict';

angular.module('customSearch.simpleContentSearch.directive', [
  'bulbs.cms.contentSearch',
  'bulbs.cms.site.config'
])
  .directive('customSearchSimpleContentSearch', function (CmsConfig) {
    return {
      link: function (scope) {

      },
      restrict: 'E',
      scope: {
        onSelect: '&'
      },
      templateUrl: CmsConfig.buildComponentPath(
        'custom-search',
        'custom-search-simple-content-search',
        'custom-search-simple-content-search.html'
      )
    };
  });
