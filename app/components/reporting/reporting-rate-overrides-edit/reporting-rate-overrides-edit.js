'use strict';

angular.module('rateOverrides.edit', [
  'rateOverrides.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
    .when('/cms/app/rate-overrides/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {
        $window.document.title = routes.CMS_NAMESPACE + ' | Edit Rate Override';
        $scope.routeId = $routeParams.id;
      },
      template: '<rate-overrides-edit id="routeId"></rate-overrides-edit>',
      reloadOnSearch: false
    });
  });