'use strict';

/**
 * Filter and directive that can be used in templates to build correct urls for the CMS.
 */
angular.module('backendHref', [
  'cms.config',
  'jquery'
])
  .filter('backendHref', function(CmsConfig) {
    return function (relUrl) {
      return CmsConfig.buildBackendUrl(relUrl);
    };
  })
  .directive('backendHref', function ($, $filter) {
    return {
      restrict: 'A',
      scope: {
        backendHref: '&'
      },
      link: function (scope, iElement) {
        $(iElement).attr('href', $filter('backendHref')(scope.backendHref()));
      }
    };
  });
