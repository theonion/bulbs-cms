'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyContainer', function (routes) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: routes.PARTIALS_URL + 'cms-notify-container.html',
      controller: 'CmsNotifyContainerCtrl'
    };
  });
