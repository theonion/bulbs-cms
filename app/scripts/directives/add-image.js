'use strict';

angular.module('bulbsCmsApp')
  .directive('addImage', function ($http, $window, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'add-image.html',
      scope: {
        article: '='
      },
      link: function (scope, element, attrs) {
        var attrName = attrs.attrName || 'images';
        scope.article[attrName] = scope.article[attrName] || [];

        if (attrs.caption === 'false') { scope.hideCaption = true; }
        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';
        scope.placeholderText = attrs.placeholderText || 'Optional Image';

        scope.addAnImage = function () {
          $window.uploadImage({
            onSuccess: function (data) {
              scope.$apply(function () {
                scope.article[attrName].push({
                  id: data.id.toString(),
                  alt: null,
                  caption: null
                });
                setTimeout($window.picturefill, 200);
              });
            },
            onError: function (data) {
              scope.$apply(function () {
                $window.alert('Error: ', data);
              });
            },
            onProgress: function (data) {

            }
          });
        };
      }

    };
  });
