'use strict';

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbs.cms.config',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/roles/', {
        controller: function($scope, $window, CmsConfig, Role) {
          $window.document.title = CmsConfig.getCmsName() + ' | Roles';
          $scope.modelFactory = Role;
        },
        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-roles-list/reporting-roles-list.html'
      });
  });
