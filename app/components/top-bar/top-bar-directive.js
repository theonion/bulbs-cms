'use strict';

/**
 * Renders a topbar template based on a given path relative to "/components/".
 */
angular.module('topBar.directive', [])
  .directive('topBar', function (routes) {
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
      templateUrl: routes.COMPONENTS_URL + 'top-bar/top-bar-base.html',
      link: function (scope) {
        scope.NAV_LOGO = routes.NAV_LOGO;
      }
    };
  });
