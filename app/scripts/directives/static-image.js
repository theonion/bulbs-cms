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
        if(scope.image && scope.image.id){
          scope.imageUrl = STATIC_IMAGE_URL.replace('{{image}}', scope.image.id);
        }else{
          scope.imageUrl = false;
        }
      }
    };
  });
