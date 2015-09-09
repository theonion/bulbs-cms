'use strict';

angular.module('content.edit.body', [])
  .directive('contentEditBody', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@',
        linkDomain: '@',
        searchHandler: '@'
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-body/content-edit-body.html'
    };
  });
