'use strict';

angular.module('bulbsCmsApp')
  .directive('slideshowPane', function ($http, $window, $compile, $) {
    return {
      restrict: 'E',
      templateUrl: '/views/slideshow-pane.html',
      scope: {
        article: '=',
        image: '=',
        index: '='
      },
      link: function (scope, element, attrs) {
        var $element = $(element);

        if (attrs.caption === 'false') {
          scope.hideCaption = true;
        }

        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';

        scope.removeImage = function (index) {
          scope.article.slides.splice(index, 1);
        };

        scope.editImage = function (index) {
          var loadingClass = 'loading-class';

          $window.openImageDrawer(
            scope.article.slides[index].id,
            function (data) {
              function removeLoadingGif() {
                $element.find('.image .' + loadingClass).remove();
              }

              removeLoadingGif();

              if ($element.find('.image').data('imageId') === data.id) {
                return;
              }

              $element.find('.image img').on('load', removeLoadingGif);
              $element.find('.image img').after(
                '<i class="' + loadingClass + ' fa fa-spinner fa-spin">'
              );

              scope.article.slides[index].id = data.id.toString();
              scope.$apply();
              $window.picturefill();
              if ($element.find('.image img')[0].complete) { removeLoadingGif(); }
            },
            function () { return; },
            function (oldImage) {
              scope.article.slides[index] = oldImage;
              $window.picturefill();
            }
          );
        };
      }
    };
  });
