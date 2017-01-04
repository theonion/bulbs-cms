'use strict';

angular.module('bulbs.cms.dateTimeModal.controller', [
  'bulbs.cms.site.config',
  'moment',
  'ui.bootstrap.modal',
])
  .controller('DatetimeSelectionModalCtrl', [
    '$scope', '$modalInstance', 'CmsConfig', 'moment',
    function ($scope, $modalInstance, CmsConfig, moment) {
      $scope.nowInTimezone = function () {
        return $scope.dateInTimezone(moment());
      };

      $scope.dateInTimezone = function (date) {
        return date.clone().tz(CmsConfig.getTimezoneName());
      };

      $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');
      $scope.dateTime = $scope.modDatetime ? $scope.dateInTimezone($scope.modDatetime) : $scope.nowInTimezone();
      $scope.time = $scope.dateTime.toDate();
      $scope.date = $scope.dateTime.clone();

      $scope.$watch('time', function () {
        var time = moment($scope.time);
        var newTime = moment()
          .year($scope.date.year())
          .dayOfYear($scope.date.dayOfYear())
          .hours(time.hours())
          .minutes(time.minutes());
        $scope.dateTime = $scope.dateInTimezone(newTime);
      });

      $scope.$watch('date', function () {
        var date = $scope.date.clone();
        var time = moment($scope.time);
        var newDate = moment()
          .year($scope.date.year())
          .dayOfYear(date.dayOfYear())
          .hours(time.hours())
          .minutes(time.minutes());
        $scope.dateTime = $scope.dateInTimezone(newDate);
      });

      $scope.setDate = function (selectedDate) {
        $scope.date = $scope.dateInTimezone(moment(selectedDate));
      };

      $scope.isDateTimeInvalid = function () {
        return !$scope.dateTime.isValid();
      };

      $scope.setDateToday = function () {
        var today = $scope.nowInTimezone();
        $scope.date = $scope.dateTime.clone()
          .year(today.year())
          .dayOfYear(today.dayOfYear());
      };

      $scope.setDateTomorrow = function () {
        var tomorrow = moment().add(1, 'day');
        $scope.date = $scope.dateInTimezone(tomorrow.clone());
      };

      $scope.setTimeNow = function () {
        var now = $scope.nowInTimezone();
        $scope.date = now.clone();
        $scope.time = now.clone().toDate();
      };

      $scope.setTimeMidnight = function () {
        var midnightTonight = $scope.nowInTimezone().startOf('day');
        $scope.date = midnightTonight.clone();
        $scope.time = midnightTonight.clone().toDate();
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
