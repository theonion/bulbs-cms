'use strict';

angular.module('sections.list.directive', [
  'bulbsCmsApp.settings',
  'confirmationModal',
  'apiServices.section.factory'
])
  .directive('sectionsList', function (routes) {
    return {
      controller: function ($scope, $location, Section) {

        $scope.$list = Section.$collection();
        $scope.$retrieve = function () {
          $scope.$list.$refresh();
        };

        $scope.$add = function () {
          $location.path('/cms/app/section/edit/new/');
        };

        $scope.$remove = function (item) {
          item.$destroy();
        };

        $scope.$retrieve();
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'sections/sections-list/sections-list.html'
    };
  });
