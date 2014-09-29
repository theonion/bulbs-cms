'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    var tempNotification = $scope.notification;

    $scope.today = moment();

    $scope.formatMomentDate = function (date, format) {
      return moment(date).format(format || 'MMM Do, YYYY h:mm a');
    };

    $scope.saveNotification = function () {
// TODO : with tests
    };

    $scope.deleteNotification = function () {
// TODO : with tests
    };

  });