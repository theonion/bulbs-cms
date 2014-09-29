'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    // keep track of changes to this notification
    $scope.notificationDirty = false;
    $scope.$watch('notification', function (newValue) {
      if (newValue) {
        $scope.notificationDirty = true;
      }
    });

    $scope.today = moment();

    $scope.formatMomentDate = function (date, format) {
      return moment(date).format(format || 'MMM Do, YYYY h:mm a');
    };

    $scope.saveNotification = function () {

      if ($scope.notificationDirty) {
        if ('id' in $scope.notification) {
          // this is a current notification, update it
          $scope.notification.put();
        } else {
          // copy notification with moments transformed into iso date strings
          var notificationClean = _.cloneDeep($scope.notification, function (value) {
            if (moment.isMoment(value)) {
              return value.format();
            }
            return value;
          });

          // not a current notification, put a new one in
          $scope.notifications.post(notificationClean).then(function (id) {
            $scope.notification.id = id;
          });
        }
      }

      // either way, notification is no longer dirty
      $scope.notificationDirty = false;
    };

    $scope.deleteNotification = function () {

      $scope.notification.remove().then(function () {
        $scope.notifications = _.without($scope.notifications, $scope.notification);
      });

    };

  });