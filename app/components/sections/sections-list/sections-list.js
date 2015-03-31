'use strict';

angular.module('sections.list', [
  'sections.list.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/section/', {
        controller: function ($scope, $window) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Section';
        },
        templateUrl: routes.COMPONENTS_URL + 'sections/sections-list/sections-list-page.html'
      });
  });
