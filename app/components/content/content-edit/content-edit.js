'use strict';

angular.module('content.edit', [
  'bulbsCmsApp.settings',
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
    '$routeProvider', 'COMPONENTS_URL',
    function ($routeProvider, COMPONENTS_URL) {
      $routeProvider
        .when('/cms/app/edit/:id/', {
          templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit.html',
          controller: 'ContentEdit'
        });
    }]);
