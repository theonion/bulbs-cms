'use strict';

/**
 * Filter and directive that can be used in templates to build correct urls for
 *  interaction with the backend.
 */
angular.module('backendApiHref', [
  'cms.config',
  'jquery'
])
  .filter('backendApiHref', [
    'CmsConfig',
    function(CmsConfig) {
      return function (relUrl) {
        return CmsConfig.buildBackendApiUrl(relUrl);
      };
    }]
  )
  .filter('backendHref', [
    'CmsConfig',
    function (CmsConfig) {
      return function (relUrl) {
        return CmsConfig.buildBackendUrl(relUrl);
      };
    }]
  )
  .directive('backendApiHref', [
    '$', '$filter',
    function ($, $filter) {
      return {
        restrict: 'A',
        scope: {
          backendApiHref: '@'
        },
        link: function (scope, iElement) {
          $(iElement).attr('href', $filter('backendApiHref')(scope.backendApiHref));
        }
      };
    }]
  )
  .directive('backendHref', [
    '$', '$filter',
    function ($, $filter) {
      return {
        restrict: 'A',
        scope: {
          backendHref: '@'
        },
        link: function (scope, iElement) {
          $(iElement).attr('href', $filter('backendHref')(scope.backendHref));
        }
      };
    }]
  );
