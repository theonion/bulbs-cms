'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (CmsConfig, routes) {
    var defaultView = routes.PARTIALS_URL + 'nav.html';

    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        return 'view' in tAttrs ? CmsConfig.getToolbarTemplateUrl(tAttrs.view) : defaultView;
      },
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getLogoUrl();
      }
    };
  });
