'use strict';

/**
 * Renders a topbar template based on a given path relative to "/components/".
 */
angular.module('topBar.directive', [
  'bulbs.cms.site.config'
])
  .directive('topBar', function (CmsConfig) {
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
        scope.NAV_LOGO = CmsConfig.getNavLogoPath();
      }
    };
  });
