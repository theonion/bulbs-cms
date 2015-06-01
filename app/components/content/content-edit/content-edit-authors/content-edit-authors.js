'use strict';

angular.module('content.edit.authors', [
  'bulbsCmsApp.settings'
])
  .directive('contentEditAuthors', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@'
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-authors/content-edit-authors.html'
    };
  });
