'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', [
    'routes', 'STATIC_IMAGE_URL',
    function (routes, STATIC_IMAGE_URL) {
      return {
        templateUrl: routes.PARTIALS_URL + 'static-image.html',
        restrict: 'E',
        scope: {
          image: '='
        },
        link: function (scope, element, attrs) {
          var ratio = attrs.ratio || '16x9';

          scope.$watch('image', function () {
            console.log(scope.image)

            if (scope.image && scope.image.id) {
              scope.imageUrl = STATIC_IMAGE_URL.replace('{{ratio}}', ratio).replace('{{image}}', scope.image.id);
            } else {
              scope.imageUrl = false;
            }
          });
        }
      };
    }
  ]);
