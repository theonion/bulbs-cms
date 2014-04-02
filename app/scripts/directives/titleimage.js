'use strict';

angular.module('bulbsCmsApp')
  .directive('titleimage', function ($http, $window, $, PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'titleimage.html',
      scope: {
        article: '=',
        image: '='
      },
      link: function (scope, element, attrs) {
        var $element = $(element);

        if (attrs.caption === 'false') { scope.hideCaption = true; }
        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';
        scope.placeholderText = attrs.placeholderText || 'Optional Image';
        scope.removeTitleImage = function () {
          scope.image = null;
        },
        scope.addTitleImage = function () {
          $window.uploadImage({
            onSuccess: function (data) {
              scope.$apply(function () {
                scope.image = {
                  id: data.id.toString(),
                  alt: null,
                  caption: null
                };
                setTimeout($window.picturefill, 200);
              });
            },
            onError: function (data) {
              scope.$apply(function () {
                alert('Error: ', data);
              });
            },
            onProgress: function (data) {

            }
          });
        },
        scope.editTitleImage = function () {
          $window.openImageDrawer(
            scope.image.id,
            function (data) {
              function removeLoadingGif() {
                $element.find('.image img[src=\"' + $window.LOADING_IMG_SRC + '\"]').remove();
              }

              removeLoadingGif();

              if ($element.find('.image').data('imageId') === data.id) {
                return;
              }

              $element.find('.image img').on('load', removeLoadingGif);
              $element.find('.image img').after('<img src=\"' + $window.LOADING_IMG_SRC + '\">');

              scope.image.id = data.id.toString();
              scope.$apply();
              $window.picturefill();
              if ($element.find('.image img')[0].complete) { removeLoadingGif(); }
            },
            function () { return; },
            function (oldImage) {
              scope.image = oldImage;
              $window.picturefill();
            }
          );
        };

      }

    };
  });
