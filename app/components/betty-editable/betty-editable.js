'use strict';

angular.module('bettyEditable', [
  'BettyCropper',
  'bulbs.cms.imageCropModal',
  'bulbs.cms.site.config',
  'ui.bootstrap.modal'
])
  .directive('bettyEditable',[
    '$http', 'CmsConfig', 'BettyCropper', 'openImageCropModal',
    function ($http, CmsConfig, BettyCropper, openImageCropModal) {
      return {
        restrict: 'E',
        templateUrl: CmsConfig.buildComponentPath('betty-editable/betty-editable.html'),
        scope: {
          addStyles: '@',
          iconStyles: '@',
          editable: '=?',
          hideMetas: '=',
          image: '=',
          placeholderText: '@',
          ratio: '@',
          onChange: '&'
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
                if (!oldImage || parseInt(response.data.id, 10) !== oldImage.id) {
                  scope.onChange();
                }
              });
            } else if (!angular.equals(newImage, oldImage)) {
              // image cleared out
              scope.onChange();
            }
          });

          scope.$watch('bettyImage', function (newImage, oldImage) {
            scope.setStyles();
          }, true);

          element.resize(scope.setStyles);

          scope.removeImage = function () {
            scope.image = null;
          };

          scope.editImage = function () {
            openImageCropModal(scope.image)
            .then(function (success) {
              console.log(success);
            });
          };

        }
      };
    }
  ]);
