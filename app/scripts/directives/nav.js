'use strict';

angular.module('bulbsCmsApp')
  .directive('nav', function (routes, navbar_options) {
    return {
      restrict: 'E',
      templateUrl: function (tElement, tAttrs) {
        var getCustomTemplate = navbar_options[tAttrs.view];

        if (getCustomTemplate) {
          return routes.DIRECTIVE_PARTIALS_URL + navbar_options[tAttrs.view] + '.html';
        } else {
          return routes.PARTIALS_URL + tAttrs.view + '.html';
        }

      },
      scope: false,
      link: function (scope, element, attrs) {
        scope.NAV_LOGO = routes.NAV_LOGO;
      }
    };
  });
