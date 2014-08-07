'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, Selection, DEFAULT_IMAGE_WIDTH, imageData, ratios) {
    $scope.selectedCrop = null;
    $scope.cropMode = false;
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

      $('.crop-image-container img').one('load', function () {
        $(this).Jcrop({
          allowSelect: false,
          allowMove: true,
          allowResize: true,
          keySupport: false,
          boxWidth: 550,
          boxHeight: 400
        }, function () {
          $scope.jcrop_api = this;
        });
      });

      $scope.image_url = image.url('original', DEFAULT_IMAGE_WIDTH, 'jpg');
      if (!$scope.ratios) {
        $scope.ratios = Object.keys(image.selections);
      }

      $scope.setThumbStyles();

      // var cropEl = angular.element('#crop-image');
      // $scope.scaleData = image.scaleToFit(550, 400);
      // $scope.crop_image_style = {
      //   height: scaleData.width,
      // };
    });

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

      var selection = $scope.image.selections[ratio].scaleToFit(DEFAULT_IMAGE_WIDTH, null);

      $scope.jcrop_api.setOptions({
        aspectRatio: selection.width() / selection.height()
      });

      $scope.jcrop_api.setSelect([
        selection.x0,
        selection.y0,
        selection.x1,
        selection.y1
      ]);

      $scope.cropMode = true;
      $scope.selectedCrop = ratio;
    };

    $scope.setThumbStyles = function () {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in $scope.image.selections) {
        var scaledSelection = $scope.image.selections[ratio].scaleToFit(180, 180);

        $scope.thumb_styles[ratio] = $scope.image.getStyles(180, 180, ratio);
      }
    };


    $scope.saveAndQuit = function () {
      // Should probably use a save directive here
      $scope.processJcropSelection($scope.jcrop_api.tellScaled());
      $scope.cropMode = false;
      // BettyCropper.updateSelection(
      //   $scope.image.id,
      //   $scope.selectedCrop[0],
      //   $scope.image.selections[$scope.selectedCrop[0]]
      // ).success(function (data) {
      //   $scope.cropMode = false;
      // });
    };

    $scope.save = function () {
      var scale = $scope.image.width / DEFAULT_IMAGE_WIDTH;

      var jcrop_selection = $scope.jcrop_api.tellSelect();
      var newSelection = new Selection({
        x0: Math.round(jcrop_selection.x * scale),
        x1: Math.round(jcrop_selection.x2 * scale),
        y0: Math.round(jcrop_selection.y * scale),
        y1: Math.round(jcrop_selection.y2 * scale),
        source: 'user'
      });
      console.log(newSelection);
    };

    $scope.saveAndNext = function () {
      this.save();

      console.log($scope.image.width);
      console.log($scope.image.selections[$scope.selectedCrop]);

      // $scope.processJcropSelection();
      // BettyCropper.updateSelection(
      //   $scope.image.id,
      //   $scope.selectedCrop[0],
      //   $scope.image.selections[$scope.selectedCrop[0]]
      // ).success(function (data) {
      //   if ($scope.uncomputedCrops.length) {
      //     $scope.setSelectedCrop(
      //       $scope.uncomputedCrops[0],
      //       $scope.image.selections[$scope.uncomputedCrops[0]]
      //     );
      //   } else {
      //     $scope.cropMode = false;
      //   }
      // });
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