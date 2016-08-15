'use strict';

angular.module('bulbs.cms.dateTimeModal.controller', [
  'bulbs.cms.site.config',
  'moment',
  'ui.bootstrap.modal'
])
  .controller('DatetimeSelectionModalCtrl', [
    '$scope', '$modalInstance', 'CmsConfig', 'moment',
    function ($scope, $modalInstance, CmsConfig, moment) {

      $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');

      // ensure that we can't choose a time if date is invalid
      $scope.dateValid = true;
      $scope.$watch('tempDatetime', function () {
        $scope.dateValid = $scope.tempDatetime.isValid();
      });

      // watch temp time to update date
      $scope.$watch('tempTime', function () {
        var newTime = moment($scope.tempTime);

        if (newTime.isValid()) {
          $scope.tempDatetime.hour(newTime.hour());
          $scope.tempDatetime.minute (newTime.minute());
          $scope.tempDatetime.second(newTime.second());
        }
      });

      // copy date temporarily so user has to actually verify change to the date
      $scope.tempDatetime = angular.copy($scope.modDatetime);
      if (!$scope.tempDatetime) {
        // default to now if no time given
        $scope.tempDatetime = moment();
      }
      $scope.tempTime = angular.copy($scope.tempDatetime);

      var timeNowWithOffset = function () {
        return moment.tz(CmsConfig.getTimezoneName());
      };

      // callback function for using datetimepicker calendar because it doesn't
      //  modify the given ngModel
      $scope.setDate = function (newDate) {
        var newDateAsMoment = moment(newDate);
        $scope.tempDatetime = ($scope.tempDatetime || moment())
          .year(newDateAsMoment.year())
          .month(newDateAsMoment.month())
          .date(newDateAsMoment.date());
      };

      $scope.setDateToday = function () {
        $scope.setDate(timeNowWithOffset());
      };

      $scope.setDateTomorrow = function () {
        $scope.setDate(timeNowWithOffset().add(1, 'day'));
      };

      $scope.setTimeNow = function () {
        $scope.tempDatetime = timeNowWithOffset();
      };

      $scope.setTimeMidnight = function () {
        $scope.tempDatetime = timeNowWithOffset()
            .hour(24)
            .minute(0)
            .second(0);
      };

      $scope.chooseDatetime = function () {
        if ($scope.dateValid) {
          // close modal, ensuring that output date is a moment
          var retMoment = moment($scope.tempDatetime);
          $modalInstance.close(retMoment);
        } else {
          console.error('Attempting to choose invalid date.');
        }
      };

    }
  ]);
