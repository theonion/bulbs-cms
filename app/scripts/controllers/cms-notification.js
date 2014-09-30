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

  });