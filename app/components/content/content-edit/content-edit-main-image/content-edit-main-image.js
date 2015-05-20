'use strict';

angular.module('content.edit.mainImage', [
  'BettyCropper'
])
  .directive('contentEditMainImage', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '=',
        inlineObjectsUrl: '@'
      },
      templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-main-image/content-edit-main-image.html'
    };
  });
