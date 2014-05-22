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
        'ratio': '@'
      },
      controller: function ($scope, $element) {

        $scope.imageData = null;

        $scope.uploadSuccess = function(response){
          if (!$scope.image) {
            $scope.image = {
              id: null,
              caption: null,
              alt: null
            };
          }
          $scope.image.id = response.id;
          $scope.imageData = response;
          $scope.showImage();
          $scope.editImage();
        }

        $scope.upload = function(e){
          if (this.files.length != 1) {
            console.log('We need exactly one image!');
            return;
          }
          var file = this.files[0];
          if (file.type.indexOf('image/') != 0) {
            console.log('Not an image!');
            return;
          }

          if (file.size > 6800000) {
            console.log('The file is too large!')
          }

          var imageData = new FormData();
          imageData.append('image', file);

          BettyCropper.new(
            file
          ).success($scope.uploadSuccess);
        };
      },
      link: function (scope, element, attrs) {
        var input = element.find('input');
        input.on('change', scope.upload);

        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);

        element
          .find('#betty-editable-add-image')
          .bind('click', function () {
            input[0].click();
          })

        scope.showImage = function () {
          if (scope.imageData === null) {
            scope.getImageData();
            return;
          }
          scope.imageStyling = scope.computeImageStyle(
            scope.imageData,
            scope.imageData.selections[scope.ratio]
          );

        };

        scope.computeImageStyle = function (image, selection) {
          var scale, styles,
          el_height = (image.height / image.width) * $(element).parent().width(),
          s_width = selection.x1 - selection.x0,
          s_height = selection.y1 - selection.y0,
          tmp_selection = selection;

          if (!s_width || !s_height) {
            /*
                If we have bogus selections, make
                the crop equal to the whole image
            */
            s_width = $(element).parent().width();
            s_height = el_height;
            tmp_selection = {
              'x0': 0,
              'y0': 0,
              'x1': s_width,
              'y1': s_height
            };
          }

          styles = {};
          scale = $(element).parent().width() / s_width;
          styles['background'] = 'url(' + BettyCropper.origJpg(scope.image.id, DEFAULT_IMAGE_WIDTH) + ')';
          styles['background-size'] = scope.scaleNumber(image.width, scale) + 'px';
          styles['background-position'] = '' +
            '-' + scope.scaleNumber(tmp_selection.x0, scale) + 'px ' +
            '-' + scope.scaleNumber(tmp_selection.y0, scale) + 'px';
          styles['background-repeat'] = 'no-repeat';
          styles['height'] = scope.scaleNumber(s_height, scale) + 'px';
          styles['width'] = scope.scaleNumber(s_width, scale) + 'px';
          styles['position'] = 'relative';

          return styles;
        };

        scope.scaleNumber = function (num, by_scale) {
          return Math.floor(num * by_scale);
        };

        scope.getImageData = function () {
          BettyCropper.detail(
            scope.image.id
          ).success(function (response) {
            scope.imageData = response;
            scope.showImage();
          }).error(function(data, status, headers, config){
            if (status === 404) {
              var el_Height = (ratioHeight / ratioWidth) * $(element).parent().width();
              scope.imageStyling = {
                'background': 'url(' + BettyCropper.url(
                  scope.image.id, scope.ratio, DEFAULT_IMAGE_WIDTH, 'jpg'
                ) + ')',
                'background-size': $(element).parent().width(),
                'height': Math.floor(el_Height) + 'px',
                'position': 'relative'
              };
            }
          });
        };

        scope.removeImage = function () {
          scope.image = null;
        };

        scope.editImage = function () {
          openImageCropModal(scope.image)
          .then(function (result) {
            if (result == 'delete') {
              scope.image = null;
            } else {
              scope.getImageData();
            }
          })
        }

        if (scope.image) {
          scope.showImage();
        }

      }
    };
  });
