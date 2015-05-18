'use strict';

/**
 * Filter and directive that can be used in templates to build correct urls for the CMS.
 */
angular.module('cmsHref', [
  'cms.config',
  'jquery'
])
  .filter('cmsHref', function(CmsConfig) {
    return function (relUrl) {
      return CmsConfig.buildAbsoluteUrl(relUrl);
    };
  })
  .directive('cmsHref', function ($, $filter) {
    return {
      restrict: 'A',
      scope: {
        cmsHref: '@'
      },
      link: function (scope, iElement) {
        $(iElement).attr('href', $filter('cmsHref')(scope.cmsHref));
      }
    };
  });
