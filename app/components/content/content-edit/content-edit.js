'use strict';

angular.module('content.edit', [
  'bulbsCmsApp.settings',
  'content.edit.authors',
  'content.edit.body',
  'content.edit.controller',
  'content.edit.editorItem',
  'content.edit.linkBrowser',
  'content.edit.mainImage',
  'content.edit.section',
  'content.edit.tags',
  'content.edit.templateChooser',
  'content.edit.title',
  'content.edit.versionBrowser',
  'utils'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, UtilsProvider) {
      $routeProvider
        .when(UtilsProvider.path.join('/cms', 'app', 'edit', ':id/'), {
          templateUrl: UtilsProvider.path.join(
            COMPONENTS_URL,
            'content',
            'content-edit',
            'content-edit.html'
          ),
          controller: 'ContentEdit'
        });
    }]);
