'use strict';

angular.module('roles.edit', [
  'roles.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/roles/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {

              $window.document.title = CMS_NAMESPACE + ' | Edit Role';

              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<roles-edit model-id="routeId"></roles-edit>',
          reloadOnSearch: false
        });
    }
  ]);
