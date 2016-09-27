'use strict';

angular.module('bulbs.cms.dateTimeModal.controller', [
  'bulbs.cms.site.config',
  'moment',
  'ui.bootstrap.modal',
])
  .controller('DatetimeSelectionModalCtrl', [
    '$scope', '$modalInstance', 'CmsConfig', 'moment',
    function ($scope, $modalInstance, CmsConfig, moment) {
      $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');
      $scope.dateTime = $scope.modDatetime ? $scope.modDatetime.clone() : moment();
      $scope.time = $scope.dateTime.toDate();
      $scope.date = $scope.dateTime.clone();

      $scope.$watch('time', function () {
        var time = moment($scope.time);
        var newTime = moment()
          .dayOfYear($scope.date.dayOfYear())
          .hours(time.hours())
          .minutes(time.minutes());
        $scope.dateTime = $scope.dateInTimezone(newTime);
      });

      $scope.$watch('date', function () {
        var date = $scope.date.clone();
        var time = moment($scope.time);
        var newDate = moment()
          .dayOfYear(date.dayOfYear())
          .hours(time.hours())
          .minutes(time.minutes());
        $scope.dateTime = $scope.dateInTimezone(newDate);
      });

      $scope.nowInTimezone = function () {
        return $scope.dateInTimezone(moment());
      };

      $scope.dateInTimezone = function (date) {
        return date.clone().tz(CmsConfig.getTimezoneName()).clone();
      };

      $scope.setDate = function (selectedDate) {
        $scope.date = $scope.dateInTimezone(moment(selectedDate)).clone();
      };

      $scope.isDateTimeInvalid = function () {
        return !$scope.dateTime.isValid();
      };

      $scope.setDateToday = function () {
        var today = $scope.nowInTimezone();
        $scope.date = $scope.dateTime.clone().dayOfYear(today.dayOfYear());
      };

      $scope.setDateTomorrow = function () {
        var tomorrow = moment().add(1, 'day');
        $scope.date = $scope.dateInTimezone(tomorrow.clone());
      };

      $scope.setTimeNow = function () {
        var now = $scope.nowInTimezone();
        $scope.date = now;
        $scope.time = now.toDate();
      };

      $scope.setTimeMidnight = function () {
        var midnightTonight = $scope.nowInTimezone().startOf('day');
        $scope.date = midnightTonight;
        $scope.time = midnightTonight.toDate();
      };

      $scope.clearDatetime = function () {
        $modalInstance.close(null);
      };

      $scope.chooseDatetime = function () {
        if ($scope.dateTime.isValid()) {
          $modalInstance.close($scope.dateTime);
        }
      };
    },
  ]);
