'use strict';

angular.module('sections.edit', [
  'sections.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/section/edit/:id/', {
        controller: function ($routeParams, $scope, $window) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Edit Section';

          $scope.routeId = $routeParams.id;
        },
        templateUrl: routes.COMPONENTS_URL + 'sections/sections-edit/sections-edit-page.html',
        reloadOnSearch: false
      });
  });
