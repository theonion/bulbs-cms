'use strict';

angular.module('content.edit.title', [])
  .directive('contentEditTitle', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-title/content-edit-title.html'
    };
  });
