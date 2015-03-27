'use strict';

angular.module('specialCoverage.edit', [
  'specialCoverage.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/special-coverage/edit/:id/', {
        controller: function ($routeParams, $scope, $window) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Edit Special Coverage';

          $scope.routeId = $routeParams.id;
        },
        templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit-page.html',
        reloadOnSearch: false
      });
  });
