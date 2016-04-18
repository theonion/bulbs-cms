'use strict';

angular.module('bulbsCmsApp')
  .controller('ReportemailmodalCtrl', function ($scope, $http, moment) {
    var reportEmailURL = '/cms/api/v1/contributor-email/';
    var now = moment().tz('America/Chicago');

    $scope.monthOptions = moment.monthsShort();
    $scope.reportDeadline = now.add(1, 'days');
    $scope.reportMonth = $scope.monthOptions[now.month() - 1];
    $scope.reportYear = now.year();

    $scope.openReportDeadline = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.startReportDeadline = true;
    };

    var getReportStart = function() {
      return moment().month($scope.reportMonth).year($scope.reportYear).startOf('month');
    };

    $scope.sendEmail = function () {
      var data = {
          deadline: $scope.reportDeadline,
          start: getReportStart()
      };
      $http.post(reportEmailURL, data);
    };
  });