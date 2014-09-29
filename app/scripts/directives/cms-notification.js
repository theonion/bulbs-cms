'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotification', function (routes, moment) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'cms-notification.html',
      scope: {
        notification: '='
      },
      controller: 'CmsNotificationCtrl'
    }
  });