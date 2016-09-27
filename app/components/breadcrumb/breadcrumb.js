'use strict';

angular.module('bulbs.cms.breadcrumb', [
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api'
])
  .directive('breadcrumb', [
    '$sce', 'CmsConfig',
    function ($sce, CmsConfig) {
      return {
        scope: {
          linksList: '='
        },
        link: function (scope, element, attrs) {
          scope.renderValue = function (value) {
            return $sce.trustAsHtml(angular.isFunction(value) ? value() : value);
          };
        },
        templateUrl: CmsConfig.buildComponentPath(
          'breadcrumb',
          'breadcrumb.html'
        )
      };
    }
  ]);
