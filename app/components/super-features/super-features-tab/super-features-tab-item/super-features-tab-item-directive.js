'use strict';

angular.module('superFeatures.item.directive', [
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
