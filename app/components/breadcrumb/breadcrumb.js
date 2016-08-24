'use strict';

angular.module('bulbs.cms.breadcrumb', [
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api'
])
  .directive('breadcrumb', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        scope: {
          linksList: '='
        },
        link: function (scope, element, attrs) {

        },
        templateUrl: CmsConfig.buildComponentPath(
          'breadcrumb',
          'breadcrumb.html'
        )
      };
    }
  ]);
