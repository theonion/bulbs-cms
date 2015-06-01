'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (CmsConfig, PARTIALS_URL) {
    var defaultView = PARTIALS_URL + 'nav.html';

    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        var template = defaultView;
        if ('view' in tAttrs) {
          try {
            template = CmsConfig.getToolbarTemplateUrl(tAttrs.view);
          } catch (e) {
            console.error(e);
          }
        }
        return template;
      },
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getLogoUrl();
      }
    };
  });
