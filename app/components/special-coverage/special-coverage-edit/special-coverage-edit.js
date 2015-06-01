'use strict';

angular.module('specialCoverage.edit', [
  'specialCoverage.edit.directive'
])
  .config(function ($routeProvider, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/special-coverage/edit/:id/', {
        controller: function ($routeParams, $scope, $window) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Edit Special Coverage';

          $scope.routeId = $routeParams.id;
        },
        template: '<special-coverage-edit model-id="routeId"></special-coverage-edit>'
      });
  });
