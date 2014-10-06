'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotifyBarCtrl', function ($scope, CmsNotificationsApi) {

    CmsNotificationsApi.getList().then(function (notifications) {
// TODO : get list of notifications that should be visible
      $scope.notifications = notifications;
    });

  });