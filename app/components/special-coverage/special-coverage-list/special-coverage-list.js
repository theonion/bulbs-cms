'use strict';

angular.module('specialCoverage.list', [
  'specialCoverage.list.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/special-coverage/', {
        controller: function ($scope, $window) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Special Coverage';
        },
        templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-list/special-coverage-list-page.html',
        reloadOnSearch: false
      });
  });
