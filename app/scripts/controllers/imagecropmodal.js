'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, img_ref) {
    $scope.cropMode = false;
    $scope.thumb = {height:170, width: 170};
    $scope.crop_thumb = {};
    $scope.img_ref = img_ref;

    $scope.crop_image_width = 550;
    $scope.image_url = BettyCropper.origJpg($scope.img_ref.id, $scope.crop_image_width);

    var setupCropper = function () {
      $('#crop-image').Jcrop({
        allowSelect: false,
        allowMove: true,
        allowResize: true,
        addClass: 'jcrop-centered',
        keySupport: false
      }, function () { // Jcrop Init Callback
        $scope.jcrop_api = this;
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
        selection.source = 'user';

        $scope.image.selections[$scope.selectedCrop[0]] = selection;
        $scope.thumb_styles[$scope.selectedCrop[0]] = $scope.computeThumbStyle(
          $scope.image,
          $scope.thumb,
          selection
        );
      }
    };

    $scope.setSelectedCrop = function (ratio, selection) {
      $scope.cropMode = true;
      if (angular.isUndefined($scope.jcrop_api)) {
        $timeout(setupCropper, 0).then(function () { // WHY DO I NEED A TIMEOUT
          $scope.selectedCrop = [ratio, selection];
        });
      } else {
        $scope.selectedCrop = [ratio, selection];
      }
    };

    $scope.$watch('selectedCrop', function (newVal) {
      if (angular.isUndefined(newVal)) {  return;  }

      var scale = $scope.crop_image_width / $scope.image.width;
      var selection = newVal[1];
      var ratioNums = newVal[0].split('x');

      $scope.currentCrop = $scope.ratioOrder.indexOf(newVal[0]);

      $scope.jcrop_api.setOptions({
        aspectRatio: ratioNums[0] / ratioNums[1]
      });

      $scope.jcrop_api.setSelect([
        $scope.scaleNumber(selection.x0, scale),
        $scope.scaleNumber(selection.y0, scale),
        $scope.scaleNumber(selection.x1, scale),
        $scope.scaleNumber(selection.y1, scale)
      ]);

      // $scope.crop_image_style = $scope.computeThumbStyle(
      //   $scope.image,
      // );

    });

    $scope.setThumbStyles = function (image, selections) {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in selections) {
        $scope.thumb_styles[ratio] = $scope.computeThumbStyle(
          image, $scope.thumb, selections[ratio]
        );
      }
    };

    $scope.computeThumbStyle = function (image, thumb, selection) {
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

    $scope.saveAndQuit = function () {
      // Should probably use a save directive here
      $scope.processJcropSelection($scope.jcrop_api.tellSelect());
      BettyCropper.updateSelection(
        $scope.image.id,
        $scope.selectedCrop[0],
        $scope.image.selections[$scope.selectedCrop[0]]
      ).success(function (data) {
        $scope.cropMode = false;
      });
    };

    $scope.saveAndNext = function () {
      $scope.processJcropSelection($scope.jcrop_api.tellSelect());
      BettyCropper.updateSelection(
        $scope.image.id,
        $scope.selectedCrop[0],
        $scope.image.selections[$scope.selectedCrop[0]]
      ).success(function (data) {
        if ($scope.uncomputedCrops.length) {
          $scope.currentCrop = $scope.ratioOrder.indexOf($scope.uncomputedCrops[0]);
          $scope.selectedCrop = [
            $scope.ratioOrder[$scope.currentCrop],
            $scope.image.selections[$scope.ratioOrder[$scope.currentCrop]]
          ];
        }
      });
    };

    $scope.$watchCollection('image.selections', function (newCollection) {
      var uncomputedCrops = [];
      for (var ratio in newCollection) {
        if (newCollection[ratio].source == 'auto') {
          uncomputedCrops.push(ratio);
        }
      }
      $scope.uncomputedCrops = uncomputedCrops;
      $scope.finished = ($scope.uncomputedCrops.length === 0);
    });

    $scope.isCurrentCropOrDone = function (ratio) {
      var classes = {};

      if ($scope.ratioOrder[$scope.currentCrop] === ratio) {
        classes['bg-info'] = true;
      }

      if ($scope.image.selections[ratio].source == 'user') {
        classes['fa-check'] = true;
      } else {
        classes['fa-circle-thin'] = true;
      }

      return classes;
    };

    $scope.onInit = function () {
      BettyCropper.detail($scope.img_ref.id)
        .success(function (data) {
          $scope.image = data;
          $scope.setThumbStyles($scope.image, $scope.image.selections);
          $scope.ratioOrder = Object.keys($scope.image.selections);

          var cropper = angular.element('.image-cropper-modal');
          cropper.focus(); // for capturing key events
          cropper.on('keyup', function (e) {
            if (e.which === 13) {
              if ($scope.cropMode) {
                $scope.uncomputedCrops.length ? $scope.saveAndNext() : $scope.saveAndQuit();
              } else {
                $modalInstance.close();
              }
            }
          });

        });
    }

    $scope.onInit();

  });
