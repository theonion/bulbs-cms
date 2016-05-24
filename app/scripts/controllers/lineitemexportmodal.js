'use strict';

angular.module('bulbsCmsApp')
  .controller('LineitemexportmodalCtrl', function ($scope, $http, moment, TIMEZONE_NAME) {
    var now = moment().tz(TIMEZONE_NAME);
    $scope.start = moment([now.year(), now.month()]);
    $scope.end = moment([now.year(), now.month() + 1]);

    $scope.apiUrl = '/cms/api/v1/contributions/line-item-reporting/?format=csv';

    $scope.updateDownloadUrl = function () {
      var start_string = $scope.start.format('YYYY-MM-DD');
      var end_string = $scope.end.format('YYYY-MM-DD');
      return $scope.apiUrl + '&start=' + start_string + '&end=' + end_string;
    };

    $scope.downloadUrl = $scope.updateDownloadUrl();

    $scope.$watchCollection('[start, end]', function () {
      $scope.downloadUrl = $scope.updateDownloadUrl();
    });


  });