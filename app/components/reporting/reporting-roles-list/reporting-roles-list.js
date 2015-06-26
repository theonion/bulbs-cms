'use strict';

// angular.module('roles.list', [
//   'bulbsCmsApp.settings',
//   'listPage',
//   'moment'
// ])
//   .config(function ($routeProvider, routes) {
//     $routeProvider
//       .when('/cms/app/roles/', {
//         controller: function($scope, $window)

//           $window.document.title = routes.CMS_NAMESPACE + ' | Section';
//       });
//   });

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/roles/', {
        controller: function($scope, $window, Reporting) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Roles';

          $scope.modelFactory = Reporting;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-roles-list/reporting-roles-list.html'
      });
  });