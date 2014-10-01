'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    // Note: use middle man for handling dates since a bug in angular.js version causes moment to not work with
    //  angular.copy. So instead of keeping notification dates as moments, keep them as strings and use moment objects
    //  for interactions.

    $scope.postDate = $scope.notification.post_date ? moment($scope.notification.post_date) : null;
    $scope.$watch('postDate', function () {
      $scope.notification.post_date = $scope.postDate ? $scope.postDate.format() : null;
    });

    $scope.notifyEndDate = $scope.notification.notify_end_date ? moment($scope.notification.notify_end_date) : null;
    $scope.$watch('notifyEndDate', function () {
      $scope.notification.notify_end_date = $scope.notifyEndDate ? $scope.notifyEndDate.format() : null;
    });

    // keep track of changes to this notification
    $scope.notificationDirty = false;
    $scope.$watch('notification', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
        $scope.notificationDirty = true;
      }
    }, true);

    /**
     * Save this notification using the parent scope.
     */
    $scope.saveNotification = function () {

      if ($scope.notificationDirty) {

        $scope.$parent.$saveNotification($scope.notification)
          .then(function (newNotification) {
            $scope.notification = newNotification;
            $scope.notificationDirty = false;
          })
          .catch(function (error) {
            console.log('Notification save failed', error);
          });

      }

    };

    /**
     * Delete this notification using the parent scope.
     */
    $scope.deleteNotification = function () {

      $scope.$parent.$deleteNotification($scope.notification)
        .catch(function (error) {
          console.log('Notification delete failed', error);
        });

    };

  });