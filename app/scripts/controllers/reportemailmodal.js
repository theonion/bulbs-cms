'use strict';

angular.module('bulbsCmsApp')
  .controller('ReportemailmodalCtrl', function ($scope, $http, moment) {
    var reportEmailURL = '/cms/api/v1/contributor-email';
    var now = moment().tz('America/Chicago');

    $scope.monthOptions = moment.monthsShort();
    $scope.reportDeadline = now.add(1, 'days');
    $scope.reportMonth = $scope.monthOptions[now.month() - 1];

    $scope.openReportDeadline = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.startReportDeadline = true;
    };

    $scope.sendEmail = function () {
      $http({
        method: 'POST',
        URL: reportEmailURL
      });
    };
  });