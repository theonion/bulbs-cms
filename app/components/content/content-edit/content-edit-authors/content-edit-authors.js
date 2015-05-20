'use strict';

angular.module('content.edit.authors', [])
  .directive('contentEditAuthors', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@'
      },
      templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-authors/content-edit-authors.html'
    };
  });
