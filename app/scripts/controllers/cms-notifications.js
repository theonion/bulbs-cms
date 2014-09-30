'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($q, $window, $scope, routes, CmsNotificationsApi) {

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

      var notification = {
        post_date: null,
        notify_end_date: null
      };

      $scope.notifications.unshift(notification);

      return notification;

    };

    $scope.$saveNotification = function (notification) {

      var saveDefer = $q.defer(),
          savePromise = saveDefer.promise;

      // transform moments into iso strings
      notification.post_date = notification.post_date.format();
      notification.notify_end_date = notification.notify_end_date.format();

      $scope.notifications.post(notification)
        .then(function (newNotification) {

          // transform iso strings back into moments
          newNotification.post_date = moment(newNotification.post_date);
          newNotification.notify_end_date = moment(newNotification.notify_end_date);

          saveDefer.resolve(newNotification);
        })
        .catch(function (error) {
          saveDefer.reject(error);
        });

      return savePromise;

    };

    $scope.$deleteNotification = function (notification) {

      var deleteDefer = $q.defer(),
          deletePromise = deleteDefer.promise;

      var i = $scope.notifications.indexOf(notification);
      if (i > -1) {
        notification.remove()
          .then(function () {
            $scope.notifications.splice(i, 1);
            deleteDefer.resolve();
          })
          .catch(function (error) {
            deleteDefer.reject(error);
          });
      }

      return deletePromise;

    };

  });
