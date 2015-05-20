'use strict';

angular.module('content.edit.body', [])
  .directive('contentEditBody', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@'
      },
      templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-body/content-edit-body.html'
    };
  });
