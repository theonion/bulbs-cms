'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotification', function (routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'cms-notification.html',
      scope: {
        notification: '='
      },
      controller: 'CmsNotificationCtrl'
    };
  });
