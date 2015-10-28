'use strict';

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbsCmsApp.settings',
    'listPage',
    'utils'
  ])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {
      $routeProvider
        .when('/cms/app/roles/', {
          controller: [
            '$scope', '$window', 'CMS_NAMESPACE', 'Role',
            function($scope, $window, CMS_NAMESPACE, Role) {
              $window.document.title = CMS_NAMESPACE + ' | Roles';

              $scope.modelFactory = Role;
            }
          ],
          templateUrl: Utils.path.join(
            COMPONENTS_URL,
            'reporting',
            'reporting-roles-list',
            'reporting-roles-list.html'
          )
        });
    }
  ]);
