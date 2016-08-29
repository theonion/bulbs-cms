'use strict';

angular.module('bulbs.cms.superFeatures.tab.item', [
  'bulbs.cms.site.config',
  'filters.moment'
])
  .directive('superFeaturesItem', function (CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: CmsConfig.buildSharedPath('super-features-tab/super-features-tab-item/super-features-tab-item.html')
    };
  });
