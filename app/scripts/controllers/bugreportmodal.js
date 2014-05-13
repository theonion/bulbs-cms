'use strict';

angular.module('bulbsCmsApp')
  .controller('BugReportModalCtrl', function ($scope, $http, $window, $modalInstance) {
    $scope.report = {};

    $scope.reportButton = {
      idle: 'Send Report',
      busy: 'Sending',
      finished: 'Sent!',
      error: 'Error!'
    };

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
          $modalInstance.close();
        });
    };
  });
