'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($window, $scope, routes, CmsNotificationsApi) {

    // set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Notifications';

    CmsNotificationsApi.getList().then(function (notifications) {
      _.each(notifications, function (notification) {
        notification.post_date = moment(notification.post_date);
        notification.notify_end_date = moment(notification.notify_end_date);
      });

      $scope.notifications = notifications;
    });

    $scope.newNotification = function () {

      $scope.notifications.unshift({
        post_date: null,
        notify_end_date: null
      });

    };

  });
