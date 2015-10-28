'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyContainer', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: PARTIALS_URL + 'cms-notify-container.html',
      controller: 'CmsNotifyContainerCtrl'
    };
  });
