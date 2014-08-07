'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, DEFAULT_IMAGE_WIDTH, imageData, ratios) {
    $scope.selectedCrop = null;
    $scope.cropMode = false;
    $scope.thumb = {height: 170, width: 170};
    $scope.crop_image = {height: 400, width: 550};
    $scope.ratios = ratios;

    if (!$scope.image) {
      $scope.image = null;
      BettyCropper.get(imageData.id).then(function(success){
        $scope.image = success.data;
      });
    }

    $scope.$watch('image', function (image) {
      if (!image) {
        return;
      }
      $scope.image_url = image.url('original', DEFAULT_IMAGE_WIDTH, 'jpg');
      if (!$scope.ratios) {
        $scope.ratios = Object.keys(image.selections);
      }

      $scope.setThumbStyles();
      var cropEl = angular.element('#crop-image');
      var scaleData = image.scaleToFit(550, 400);
      $scope.crop_image_style = {
        height: scaleData.height,
        width: scaleData.width
      };

      $('#crop-image').Jcrop({
        allowSelect: false,
        allowMove: true,
        allowResize: true,
        addClass: 'jcrop-centered',
        keySupport: false
      }, function () { // Jcrop Init Callback
        $scope.jcrop_api = this;
      });

    });

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

        var length;
        if ($scope.image.width > $scope.image.height) {
          length = 'width';
        } else {
          length = 'height';
        }
        var scale = $scope.crop_image[length] / $scope.image[length];
        selection.x0 = roundSelection($scope.scaleNumber(s.x, 1 / scale), $scope.image.width);
        selection.y0 = roundSelection($scope.scaleNumber(s.y, 1 / scale), $scope.image.height);
        selection.x1 = roundSelection($scope.scaleNumber(s.x2, 1 / scale), $scope.image.width);
        selection.y1 = roundSelection($scope.scaleNumber(s.y2, 1 / scale), $scope.image.height);
        selection.source = 'user';

        var ratio = $scope.selectedCrop[0];

        $scope.image.selections[ratio] = selection;
        $scope.thumb_styles[ratio] = image.getStyles(170, 170, ratio);
      }
    };

    function roundSelection(number, max) {
      if (number < 0) { return 0; }
      if (number > max) { return max; }
      return number;
    }

    $scope.selectCrop = function (ratio) {
      if (!ratio) {
        ratio = Object.keys($scope.image.selections)[0];
        for (var key in $scope.image.selections) {
          if ($scope.image.selections[key].source === 'auto') {
            ratio = key;
            break;
          }
        }
      }

      $scope.cropMode = true;
      $scope.selectedCrop = ratio;
    };

    // $scope.$watch('selectedCrop', function (newVal) {
    //   if (angular.isUndefined(newVal)) {  return;  }

    //   var length;
    //   if ($scope.image.width > $scope.image.height) {
    //     length = 'width';
    //   } else {
    //     length = 'height';
    //   }
    //   var scale = $scope.crop_image[length] / $scope.image[length];
    //   var selection = newVal[1];
    //   var ratioNums = newVal[0].split('x');

    //   $scope.currentCrop = newVal[0];

    //   $scope.jcrop_api.setOptions({
    //     aspectRatio: ratioNums[0] / ratioNums[1]
    //   });

    //   $scope.jcrop_api.setSelect([
    //     $scope.scaleNumber(selection.x0, scale),
    //     $scope.scaleNumber(selection.y0, scale),
    //     $scope.scaleNumber(selection.x1, scale),
    //     $scope.scaleNumber(selection.y1, scale)
    //   ]);

    // });

    $scope.setThumbStyles = function () {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in $scope.image.selections) {
        var scaledSelection = $scope.image.selections[ratio].scaleToFit(180, 180);

        $scope.thumb_styles[ratio] = $scope.image.getStyles(180, 180, ratio);
      }
    };

    $scope.computeImageTagStyle = function (thumb) {
      var styles = {};

      if ($scope.image.width > $scope.image.height) {
        styles.width = thumb.width;
      } else {
        styles.height = thumb.height;
      }

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
          $scope.setSelectedCrop(
            $scope.uncomputedCrops[0],
            $scope.image.selections[$scope.uncomputedCrops[0]]
          );
        } else {
          $scope.cropMode = false;
        }
      });
    };

    // $scope.$watchCollection('image.selections', function (newCollection, oldCollection) {

    // });

    $scope.isCurrentCropOrDone = function (ratio) {
      var classes = {};

      if ($scope.currentCrop === ratio) {
        classes['bg-info'] = true;
      }

      if ($scope.image.selections[ratio].source === 'user') {
        classes['fa-check bootstrap-green'] = true;
      } else {
        classes['fa-circle-thin'] = true;
      }

      return classes;
    };

    $scope.isCropDone = function (ratio) {
      var classes = {};

      if ($scope.image.selections[ratio].source === 'user') {
        classes['fa-check bootstrap-green'] = true;
      }

      return classes;
    };

  });
