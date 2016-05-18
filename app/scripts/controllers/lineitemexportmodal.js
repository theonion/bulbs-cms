'use strict';

angular.module('bulbsCmsApp')
  .controller('LineitemexportmodalCtrl', function ($scope, $http, moment) {
    var reportEmailURL = '/cms/api/v1/line-items/';
    var now = moment().tz('America/Chicago');

    $scope.start = moment([now.year(), now.month()]);
    $scope.end = moment([now.year(), now.month() + 1]);

    $scope.download = function () {
      var data = {
        format: 'csv',
        start: $scope.start,
        end: $scope.end
      };
      $http.post(reportEmailURL, data);
    };
  });