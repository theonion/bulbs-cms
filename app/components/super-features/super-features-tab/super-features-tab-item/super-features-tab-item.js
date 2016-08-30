'use strict';

angular.module('bulbs.cms.superFeatures.tab.item', [
  'bulbs.cms.site.config',
  'filters.moment'
])
  .directive('superFeaturesTabItem', function (CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: CmsConfig.buildComponentPath(
        'super-features',
        'super-features-tab',
        'super-features-tab-item',
        'super-features-tab-item.html'
      )
    };
  });
