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
          image: '='
        },
        link: function (scope, element, attrs) {
          var ratio = attrs.ratio || '16x9';

          scope.$watch('image', function () {
            if (scope.image && scope.image.id) {
              scope.imageUrl = CmsConfig.buildImageApiUrl(ratio, scope.image.id, '1200.jpg');
            } else {
              scope.imageUrl = false;
            }
          });
        }
      };
    }
  ]);
