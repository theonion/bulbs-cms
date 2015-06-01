'use strict';

angular.module('content.edit.title', [
  'bulbsCmsApp.settings'
])
  .directive('contentEditTitle', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-title/content-edit-title.html'
    };
  });
