'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (CmsConfig, CurrentUser) {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        return CmsConfig.getTopBarMapping(tAttrs.view);
      },
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getNavLogoPath();
        scope.current_user = CurrentUser;
      }
    };
  });
