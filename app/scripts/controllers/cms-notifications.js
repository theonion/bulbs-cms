'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($window, $scope, routes, ContentApi) {

    // set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Notifications';

    ContentApi.all('notifications').getList().then(function (notifications) {

      _.each(notifications, function (notification) {
        notification.post_date = new Date(notification.post_date);
        notification.notify_end_date = new Date(notification.notify_end_date);
      });

      $scope.notifications = notifications;
    });


  });