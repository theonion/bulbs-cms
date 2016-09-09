'use strict';

angular.module('bulbs.cms.superFeatures.tab.item', [
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'filters.moment'
])
  .directive('superFeaturesTabItem', function (CmsConfig, SuperFeaturesApi) {
    return {
      link: function (scope) {

        var requestSuperFeature = function () {

          if (angular.isNumber(scope.model)) {
            SuperFeaturesApi.getSuperFeature(scope.model)
              .then(function (superFeature) {
                scope.superFeature = superFeature;
              });
          }
        };

        scope.$watch('model', requestSuperFeature);
      },
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
