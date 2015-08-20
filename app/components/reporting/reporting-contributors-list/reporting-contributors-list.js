'use strict';

angular.module('contributors.list', [
    'apiServices.contributor.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/reporting/contributors/', {
        controller: function($scope, $window, Contributor) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Roles';

          $scope.modelFactory = Contributor;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-contributors-list/reporting-contributors-list.html'
      });
  });