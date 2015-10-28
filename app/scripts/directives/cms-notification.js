'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotification', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'cms-notification.html',
      scope: {
        notification: '='
      },
      controller: 'CmsNotificationCtrl'
    };
  });
