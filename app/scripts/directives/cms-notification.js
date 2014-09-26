'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotification', function (routes, moment) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'cms-notification.html',
      scope: {
        notification: '=notification'
      },
      controller: 'CmsNotificationCtrl',
      link: function (scope) {
        scope.formatDate = function (date) {
          return moment(date).format('ddd, MMM Do, YYYY');
        };
      }
    }
  });