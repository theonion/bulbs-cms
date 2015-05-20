'use strict';

angular.module('contentEdit.metadata', [])
  .directive('contentEditMetadata', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-metadata/content-edit-metadata.html'
    };
  });
