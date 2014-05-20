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
        $scope.showModal = function () {
          $scope.modalVisible = true;
        };

        $scope.dismissModal = function () {
          $scope.modalVisible = false;
        }

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
              $element.find('.modal-body').html('\
                <h6>Thanks for taking the time to fill out a bug report!</h6>\
                <h6>This let\'s us know what problems you\'re running into and how to reproduce them.</h6>\
                <h6>That way we can fix them as fast as possible.</h6>\
                <h6>We promise.</h6>\
              ');
              $timeout(function() {
                $scope.dismissModal();
              }, 5000);
            });
        };

      },
      link: function (scope, element) {

      }
    }
  });
