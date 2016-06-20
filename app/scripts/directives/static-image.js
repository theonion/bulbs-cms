'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', function (CmsConfig) {
    return {
      templateUrl: '/views/static-image.html',
      restrict: 'E',
      scope: {
        'image': '='
      },
      link: function postLink(scope, element, attrs) {
        var ratio = attrs.ratio || '16x9';

        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl = CmsConfig.buildImageApiUrl(ratio, '' + scope.image.id, '1200.jpg');
          } else {
            scope.imageUrl = false;
          }
        });
      }
    };
  });
