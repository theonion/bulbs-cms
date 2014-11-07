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
        'editable': '=?'
      },
      controller: function ($scope, $element) {
        $scope.editable = angular.isDefined($scope.editable) ? $scope.editable : true;
        $scope.upload = function (e) {
          BettyCropper.upload().then(
            function (success) {
              $scope.image = {
                id: success.id,
                caption: null,
                alt: null
              };
              $scope.bettyImage = success;
            },
            function (error) {
              console.log(error);
            },
            function (progress) {
              console.log(progress);
            }
          );
        };

        $scope.edit = function (e) {
          openImageCropModal($scope.image).then(function (image) {
            if (image.id === null) {
              $scope.image = null;
            } else {
              $scope.image = image;
              BettyCropper.get($scope.image.id).then(function (response) {
                $scope.bettyImage = response.data;
                $scope.setStyles();
              });
            }
          });
        };
      },

      link: function (scope, element, attrs) {

        if (scope.bettyImage === undefined) {
          scope.bettyImage = null;
        }

        scope.setStyles = function () {
          if (scope.bettyImage) {
            scope.imageStyling = scope.bettyImage.getStyles(element.parent().width(), null, scope.ratio);
          } else {
            var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
            var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);
            scope.imageStyling = {
              'background-color': '#333',
              'position': 'relative',
              'width': element.parent().width(),
              'height': Math.floor(element.parent().width() * ratioHeight / ratioWidth) + 'px',
            };
          }
        };

        scope.$watch('image', function (newImage, oldImage) {
          if (newImage && newImage.id) {
            BettyCropper.get(newImage.id).then(function (response) {
              scope.bettyImage = response.data;
            });
          }
        });

        scope.$watch('bettyImage', function (newImage, oldImage) {
          scope.setStyles();
        }, true);

        element.resize(scope.setStyles);

        scope.removeImage = function () {
          scope.image.id = null;
        };

        scope.editImage = function () {
          openImageCropModal(scope.image)
          .then(function (success) {
            console.log(success);
          });
        };

      }
    };
  });
