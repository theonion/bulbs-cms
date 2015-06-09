'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', function (PARTIALS_URL, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'static-image.html',
      restrict: 'E',
      scope: {
        'image': '='
      },
      link: function postLink(scope, element, attrs) {
        var ratio = attrs.ratio || '16x9';

        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl =
              CmsConfig.buildImageServerUrl(
                '/' + ratio + '/' + scope.image.id + '/' + CmsConfig.getImageDefaultWidth() + '.jpg'
              );
          } else {
            scope.imageUrl = false;
          }
        });
      }
    };
  });
