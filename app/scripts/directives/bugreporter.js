'use strict';

angular.module('bulbsCmsApp')
  .directive('bugReporter', function ($http, $window, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bug-report-button.html',
      scope: {},
      controller: function ($scope, $element, $timeout) {
        $scope.report = {};
        $scope.reportButton = {
          idle: 'Submit',
          busy: 'Sending',
          finished: 'Sent!',
          error: 'Error!'
        };

        $scope.modalVisible = false;
        $scope.showThankYou = false;

        $scope.showModal = function () {
          $scope.modalVisible = true;
        };

        $scope.dismissModal = function () {
          $scope.modalVisible = false;
          $scope.showThankYou = false;
        };

        $scope.sendToWebtech = function () {
          var report =
            'When I tried to:\n\n' + $scope.report.firstRes + '\n\n' +
            'I thought this would happen:\n\n' + $scope.report.secondRes + '\n\n' +
            '...but this happened instead:\n\n' + $scope.report.thirdRes
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
              $scope.showThankYou = true;
              $timeout(function () {
                $scope.dismissModal();
                for (var entry in $scope.report) {
                  $scope.report[entry] = '';
                }
              }, 5000);
            });
        };

        /*
          Exposing this globally for PNotify.
          Will revisit when we review how to
          report bugs on the CMS.
        */
        $window.showBugReportModal = function () {
          $scope.$apply($scope.showModal());
        };

      },
      link: function (scope, element) {

      }
    };
  });
