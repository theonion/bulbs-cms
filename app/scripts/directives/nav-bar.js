'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (routes, navbar_options) {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        // load navbar view template
        if (navbar_options[tAttrs.view]) {
          return routes.DIRECTIVE_PARTIALS_URL + navbar_options[tAttrs.view] + '.html';
        } else {
          return routes.PARTIALS_URL + tAttrs.view + '.html';
        }
      },
      link: function (scope) {
        scope.NAV_LOGO = routes.NAV_LOGO;
      }
    };
  });
