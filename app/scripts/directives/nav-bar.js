'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (CmsConfig, routes, navbar_options,
      CurrentUser) {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        if (navbar_options[tAttrs.view]) {
          return CmsConfig.buildDirectivePartialsPath(navbar_options[tAttrs.view] + '.html');
        } else {
          return routes.PARTIALS_URL + tAttrs.view + '.html';
        }
      },
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getNavLogoPath();
        scope.current_user = CurrentUser;
      }
    };
  });
