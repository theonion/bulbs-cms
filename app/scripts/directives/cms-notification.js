'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotification', function () {
    return {
      restrict: 'E',
      templateUrl: '/views/cms-notification.html',
      scope: {
        cmsNotification: '='
      },
      controller: 'CmsNotificationCtrl'
    };
  });
