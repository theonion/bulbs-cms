'use strict';

angular.module('roles.edit', [
  'roles.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
    .when('/cms/app/roles/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {
        $window.document.title = routes.CMS_NAMESPACE + ' | Edit Role';

        $scope.routeId = $routeParams.id;
      },
      template: '<roles-edit model-id="routeId"></roles-dit>',
      reloadOnSearch: false
    });
  });