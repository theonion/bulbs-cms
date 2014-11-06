'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', function (routes, STATIC_IMAGE_URL) {
    return {
      templateUrl: routes.PARTIALS_URL + 'static-image.html',
      restrict: 'E',
      scope: {
        'image': '='
      },
      link: function postLink(scope, element, attrs) {
        var ratio = attrs.ratio || '16x9';

        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl = STATIC_IMAGE_URL.replace('{{ratio}}', ratio).replace('{{image}}', scope.image.id);
          } else {
            scope.imageUrl = false;
          }
        });
      }
    };
  });
