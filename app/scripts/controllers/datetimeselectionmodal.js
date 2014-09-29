'use strict';

angular.module('bulbsCmsApp')
  .controller('DatetimeSelectionModalCtrl', function ($scope, $modalInstance, TIMEZONE_OFFSET, TIMEZONE_LABEL) {

    // copy date temporarily so user has to actually verify change to the date
    $scope.tempDatetime = angular.copy($scope.modDatetime);

    $scope.TIMEZONE_LABEL = TIMEZONE_LABEL;

    var timeNowWithOffset = function () {
      return moment().zone(TIMEZONE_OFFSET);
    };

    $scope.setDateToday = function () {
      var now = timeNowWithOffset();
      $scope.tempDatetime = moment().year(now.year()).month(now.month()).date(now.date());
    };

    $scope.setDateTomorrow = function () {
      var now = timeNowWithOffset();
      $scope.tempDatetime = moment().year(now.year()).month(now.month()).date(now.date() + 1);
    };

    $scope.setTimeNow = function () {
      $scope.tempDatetime = timeNowWithOffset();
    };

    $scope.setTimeMidnight = function () {
      $scope.tempDatetime = timeNowWithOffset().hour(24).minute(0);
    };

    $scope.chooseDatetime = function () {
      $modalInstance.close($scope.tempDatetime);
    };

  });