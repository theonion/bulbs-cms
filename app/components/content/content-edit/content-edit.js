'use strict';

angular.module('content.edit', [
  'content.edit.authors',
  'content.edit.body',
  'content.edit.controller',
  'content.edit.editorItem',
  'content.edit.linkBrowser',
  'content.edit.mainImage',
  'content.edit.metadata',
  'content.edit.title',
  'content.edit.templateChooser'
])
  .config([
    '$routeProvider', 'routes',
    function ($routeProvider, routes) {
      $routeProvider
        .when('/cms/app/edit/:id/', {
          templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit.html',
          controller: 'ContentEdit'
        });
    }]);
