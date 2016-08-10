'use strict';

angular.module('bulbs.cms.staticImage', [
  'bulbs.cms.site.config'
])
  .directive('staticImage', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        templateUrl: CmsConfig.buildComponentPath(
          'static-image',
          'static-image.html'
        ),
        restrict: 'E',
        scope: {
          image: '=',
          ratio: '@'
        },
        link: function (scope, element, attrs) {

          scope.$watch('image', function () {
            if (scope.image && scope.image.id) {
              scope.imageUrl = CmsConfig.buildImageApiUrl(
                scope.image.id,
                scope.ratio || '16x9',
                '1200.jpg'
              );
            } else {
              scope.imageUrl = false;
            }
          });
        }
      };
    }
  ]);
