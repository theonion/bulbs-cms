'use strict';

/**
 * Renders a topbar template based on a given path relative to "/components/".
 */
angular.module('topBar.directive', [
  'bulbs.cms.site.config',
  'bulbsCmsApp.settings'
])
  .directive('topBar', function (CmsConfig, routes) {
    return {
      restrict: 'E',
      scope: {
        logoHref: '@',
        itemsDropdownTitle: '@',
        itemsDropdown: '=',
        itemsTop: '=',
        saveFunction: '=',
        saveDisableWhen: '&'
      },
      templateUrl: CmsConfig.buildComponentPath('top-bar/top-bar-base.html'),
      link: function (scope) {
        scope.NAV_LOGO = routes.NAV_LOGO;
      }
    };
  });
