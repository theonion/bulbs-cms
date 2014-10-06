'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyBar', function (routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'cms-notify-bar.html',
      scope: {},
      controller: 'CmsNotifyBarCtrl'
    }
  });