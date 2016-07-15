'use strict';

angular.module('bulbs.cms.dateTimeModal.controller', [
  'bulbs.cms.site.config',
  'ui.bootstrap.modal'
])
  .controller('DatetimeSelectionModalCtrl', [
    '$scope', '$modalInstance', 'CmsConfig', 'moment',
    function ($scope, $modalInstance, CmsConfig, moment) {

      // ensure that we can't choose a time if date is invalid
      $scope.dateValid = false;
      $scope.$watch('tempDatetime', function () {
        $scope.dateValid = moment($scope.tempDatetime).isValid();
      });

      // copy date temporarily so user has to actually verify change to the date
      $scope.tempDatetime = angular.copy($scope.modDatetime);
      if (!$scope.tempDatetime) {
        // default to now if no time given
        $scope.tempDatetime = moment();
      }

      $scope.TIMEZONE_LABEL = moment.tz(CmsConfig.getTimezoneName()).format('z');

      var timeNowWithOffset = function () {
        return moment.tz(CmsConfig.getTimezoneName());
      };

      // callback function for using datetime calendar because it doesn't work at all in a sensible way
      $scope.setDate = function (newDate) {
        $scope.tempDatetime = moment(newDate);
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
