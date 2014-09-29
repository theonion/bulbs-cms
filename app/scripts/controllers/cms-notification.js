'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    $scope.today = moment();

    $scope.formatMomentDate = function (date, format) {
      return moment(date).format(format || 'ddd, MMM Do, YYYY');
    };

  });