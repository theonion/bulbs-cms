'use strict';

angular.module('roles.edit', [
  'bulbs.cms.site.config',
  'roles.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/cms/app/roles/edit/:id/', {
      controller: function ($routeParams, $scope, $window, CmsConfig) {
        $window.document.title = CmsConfig.getCmsName() + ' | Edit Role';
        $scope.routeId = $routeParams.id;
      },
      template: '<roles-edit model-id="routeId"></roles-edit>',
      reloadOnSearch: false
    });
  });
