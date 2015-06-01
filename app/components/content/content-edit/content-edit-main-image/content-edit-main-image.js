'use strict';

angular.module('content.edit.mainImage', [
  'BettyCropper'
])
  .directive('contentEditMainImage', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@'
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-main-image/content-edit-main-image.html'
    };
  });
