'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', function (CmsConfig, CurrentUserApi) {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: function (tElement, tAttrs) {
        return CmsConfig.getTopBarMapping(tAttrs.view);
      },
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getNavLogoPath();

        CurrentUserApi.getCurrentUserWithCache()
          .then(function (user) {
            scope.currentUser = user;
          });
      }
    };
  });
