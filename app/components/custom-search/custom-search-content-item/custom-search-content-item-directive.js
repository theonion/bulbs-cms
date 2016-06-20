'use strict';

angular.module('customSearch.contentItem.directive', [
  'bulbs.cms.site.config'
])
  .directive('customSearchContentItem', function (CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        controllerService: '=',
        onUpdate: '&'
      },
      templateUrl: CmsConfig.buildComponentPath('custom-search/custom-search-content-item/custom-search-content-item.html')
    };
  });
