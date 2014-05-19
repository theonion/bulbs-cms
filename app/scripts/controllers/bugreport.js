'use strict';

angular.module('bulbsCmsApp')
  .controller('BugReportCtrl', function ($scope, $http, $window, routes) {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.report = {};
    $scope.reportButton = {
      idle: 'Submit',
      busy: 'Sending',
      finished: 'Sent!',
      error: 'Error!'
    };

    $scope.modalVisible = false;
    $scope.showModal = function () {
      $scope.modalVisible = true;
    };

    $scope.dismissModal = function () {
      $scope.modalVisible = false;
    }

    $scope.sendToWebtech = function () {
      var report =
        'When I try to ' + $scope.report.whenITry + '\n\n' +
        'I expected ' + $scope.report.iExpected + '\n\n' +
        'But I got ' + $scope.report.butIGot
      ;
      var data = {
        report: report,
        url: $window.location.href,
        user_agent: $window.navigator.userAgent
      };
      return $http.post('/cms/api/v1/report-bug/', data);
    };

    $scope.sendToWebtechCbk = function (promise) {
      promise
        .then(function () {
          $scope.dismissModal();
        });
    };


  });
