'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyContainer', function () {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: '/views/cms-notify-container.html',
      controller: 'CmsNotifyContainerCtrl'
    };
  });
