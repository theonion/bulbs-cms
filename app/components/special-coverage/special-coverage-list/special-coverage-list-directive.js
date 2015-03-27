'use strict';

angular.module('specialCoverage.list.directive', [
  'bulbsCmsApp.settings',
  'confirmationModal',
  'apiServices.specialCoverage.factory'
])
  .directive('specialCoverageList', function (routes) {
    return {
      controller: function ($scope, $location, SpecialCoverage) {

        $scope.$list = SpecialCoverage.$collection();
        $scope.$retrieve = function () {
          $scope.$list.$refresh();
        };

        $scope.$add = function () {
          $location.path('/cms/app/special-coverage/edit/new/');
        };

        $scope.$remove = function (item) {
          item.$destroy();
        };

        $scope.$retrieve();
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-list/special-coverage-list.html'
    };
  });
