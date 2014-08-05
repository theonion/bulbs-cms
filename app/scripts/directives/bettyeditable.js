'use strict';

angular.module('bulbsCmsApp')
  .directive('bettyeditable', function ($http, routes, BettyCropper, openImageCropModal, DEFAULT_IMAGE_WIDTH) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bettyeditable.html',
      scope: {
        'image': '=',
        'addStyles': '@',
        'placeholderText': '@',
        'hideMetas': '=',
        'ratio': '@',
      },
      controller: function ($scope, $element) {
        $scope.upload = function (e) {
          BettyCropper.upload().then(
            function (success) {
              if (!$scope.image) {
                $scope.image = {
                  id: null,
                  caption: null,
                  alt: null
                };
                $scope.image.id = success.id;
                $scope.bettyImage = success;
              }
            },
            function (error) {
              console.log(error);
            },
            function (progress) {
              console.log(progress);
            }
          );
        };
      },

      link: function (scope, element, attrs) {
        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);

        scope.imageStyling = {
          'background-color': '#333',
          'position': 'relative',
          'width': element.parent().width(),
          'height': Math.floor(element.parent().width() * ratioHeight / ratioWidth) + 'px',
        };

        if (scope.bettyImage) {
          scope.setStyles();
        } else {
          BettyCropper.get(scope.image.id).then(function(response){
            scope.bettyImage = response.data;
            scope.setStyles();
          });
        }

        scope.setStyles = function () {
          scope.imageStyling = scope.bettyImage.getStyles(element, scope.ratio);
        };

        scope.removeImage = function () {
          scope.image.id = null;
        };

        scope.editImage = function () {
          openImageCropModal(scope.image)
          .then(function (image) {
            if (image.id === null) {
              scope.image = null;
            } else {
              scope.image = image;
              scope.getImageData();
            }
          });
        };

      }
    };
  });
