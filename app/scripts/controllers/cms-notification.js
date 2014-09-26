'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    $scope.today = moment();

  });