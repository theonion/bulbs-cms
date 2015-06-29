'use strict';

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/roles/', {
        controller: function($scope, $window, Role) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Roles';

          $scope.modelFactory = Role;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-roles-list/reporting-roles-list.html'
      });
  });