'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($window, $document, $compile, $rootScope, $modal, routes) {
    var openImageCropModal = function (id) {
      var ModalInstanceCtrl = function ($scope, $timeout, BettyCropper, $modalInstance, id) {
        var jcrop_api;
        $scope.cropMode = false;
        $scope.thumb = {height:180, width: 180};
        $scope.preview_thumb = {height: 110, width: 110};

        $scope.crop_image_width = 550;
        $scope.image_url = BettyCropper.origJpg(id, $scope.crop_image_width);
        $scope.preview_style = {};

        var setupCropper = function () {
          $('#crop-image').Jcrop({
            allowSelect: false,
            allowMove: true,
            allowResize: true,
            keySupport: false
          }, function () { // Jcrop Init Callback
            jcrop_api = this;
            $scope.selectedCrop = [
              $scope.ratioOrder[$scope.currentCrop],
              $scope.image.selections[$scope.ratioOrder[$scope.currentCrop]]
            ];
          });
        };

        $scope.processJcropSelection = function (s) {
          if (
            angular.isNumber(s.x) && !isNaN(s.x) ||
            angular.isNumber(s.y) && !isNaN(s.y) ||
            angular.isNumber(s.x2) && !isNaN(s.x2) ||
            angular.isNumber(s.y2) && !isNaN(s.y2) ||
            angular.isNumber(s.w) && !isNaN(s.w) ||
            angular.isNumber(s.h) && !isNaN(s.h)
          ) {
            var selection = {};

            var scale = $scope.crop_image_width / $scope.image.width;
            selection.x0 = $scope.scaleNumber(s.x, 1 / scale);
            selection.y0 = $scope.scaleNumber(s.y, 1 / scale);
            selection.x1 = $scope.scaleNumber(s.x2, 1 / scale);
            selection.y1 = $scope.scaleNumber(s.y2, 1 / scale);

            $scope.image.selections[$scope.selectedCrop[0]] = selection;
            $scope.thumb_styles[$scope.selectedCrop[0]] = $scope.computeThumbStyle(
              $scope.image,
              $scope.thumb,
              $scope.selectedCrop[0],
              selection
            );
            $scope.preview_style = $scope.computeThumbStyle(
              $scope.image,
              $scope.preview_thumb,
              $scope.selectedCrop[0],
              selection
            );
          }
        };

        $scope.setSelectedCrop = function (ratio, selection) {
          $scope.cropMode = true;
          if (angular.isUndefined(jcrop_api)) {
            $timeout(setupCropper, 0).then(function () { // WHY DO I NEED A TIMEOUT
              $scope.selectedCrop = [ratio, selection];
            });
          } else {
            $scope.selectedCrop = [ratio, selection];
          }
        };

        $scope.$watch('selectedCrop', function (newVal) {
          if (angular.isUndefined(newVal)) {  return;  }

          $scope.preview_style = $scope.computeThumbStyle(
            $scope.image,
            $scope.preview_thumb,
            newVal[0],
            newVal[1]
          );

          var scale = $scope.crop_image_width / $scope.image.width;
          var selection = newVal[1];
          var ratioNums = newVal[0].split('x');

          jcrop_api.setOptions({
            aspectRatio: ratioNums[0] / ratioNums[1]
          });

          jcrop_api.setSelect([
            $scope.scaleNumber(selection.x0, scale),
            $scope.scaleNumber(selection.y0, scale),
            $scope.scaleNumber(selection.x1, scale),
            $scope.scaleNumber(selection.y1, scale)
          ]);
        });

        $scope.setThumbStyles = function (image, selections) {
          $scope.thumb_styles = $scope.thumb_styles || {};

          for (var ratio in selections) {
            $scope.thumb_styles[ratio] = $scope.computeThumbStyle(
              image, $scope.thumb, ratio, selections[ratio]
            );
          }
        };

        $scope.computeThumbStyle = function (image, thumb, ratio, selection) {
          var scale, styles, h_or_w, selection_length,
          s_width = selection.x1 - selection.x0,
          s_height = selection.y1 - selection.y0;
          if (s_width < s_height) {
            h_or_w = 'height';
            selection_length = s_height;
          } else {
            h_or_w = 'width';
            selection_length = s_width;
          }

          styles = {};
          scale = thumb[h_or_w] / selection_length;
          styles['background'] = 'url(' + $scope.image_url + ')';
          styles['background-size'] = $scope.scaleNumber($scope.image.width, scale) + 'px';
          styles['background-position'] = '' +
            '-' + $scope.scaleNumber(selection.x0, scale) + 'px ' +
            '-' + $scope.scaleNumber(selection.y0, scale) + 'px';
          styles['background-repeat'] = 'no-repeat';
          styles['height'] = $scope.scaleNumber(s_height, scale) + 'px';
          styles['width'] = $scope.scaleNumber(s_width, scale) + 'px';
          styles['top'] = '50%';
          styles['margin-top'] = '-' + ($scope.scaleNumber(s_height, scale) / 2) + 'px';

          return styles;
        };

        $scope.scaleNumber = function (num, by_scale) {
          return Math.floor(num * by_scale);
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.back = function () {
          $scope.cropMode = false;
        }

        $scope.saveAndQuit = function () {
          // Should probably use a save directive here
          $scope.processJcropSelection(jcrop_api.tellSelect());
          BettyCropper.update_selection(
            $scope.image.id,
            $scope.selectedCrop[0],
            $scope.image.selections[$scope.selectedCrop[0]]
          ).success(function (data) {
            $modalInstance.close(); // Should be passing updated styling here
          });
        };

        $scope.saveAndNext = function () {
          $scope.processJcropSelection(jcrop_api.tellSelect());
          BettyCropper.update_selection(
            $scope.image.id,
            $scope.selectedCrop[0],
            $scope.image.selections[$scope.selectedCrop[0]]
          ).success(function (data) {
            var next = $scope.currentCrop + 1;
            if (next >= $scope.ratioOrder.length) {
              next = 0;
            }
            $scope.currentCrop = next;
            $scope.selectedCrop = [
              $scope.ratioOrder[$scope.currentCrop],
              $scope.image.selections[$scope.ratioOrder[$scope.currentCrop]]
            ];
          });
        };

        $scope.isCurrentCrop = function (ratio) {
          if ($scope.ratioOrder[$scope.currentCrop] === ratio) {
            return {color: '#5bc0de'};
          }
        };

        BettyCropper.detail(id)
          .success(function (data) {
            $scope.image = data;
            $scope.setThumbStyles($scope.image, $scope.image.selections);
            $scope.ratioOrder = Object.keys($scope.image.selections);
            $scope.currentCrop = 0;
          });

      };

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + "image-crop-modal.html",
        controller: ModalInstanceCtrl,
        resolve: {
          id: function () { return id; }
        }
      }).result;

    };
    $window.openImageCropModal = openImageCropModal; // THIS IS SOME BULLSHIT
    return openImageCropModal;
  })
