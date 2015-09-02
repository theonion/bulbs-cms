'use strict';

angular.module('content.edit.metadata', [
  'bulbsCmsApp.settings',
  'content.edit.sections',
  'content.edit.tags'
])
  .directive('contentEditMetadata', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-metadata/content-edit-metadata.html'
    };
  });
