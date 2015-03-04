'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, Selection, DEFAULT_IMAGE_WIDTH, imageData, ratios, $) {
    $scope.selectedCrop = null;
    $scope.cropMode = false;
    $scope.ratios = ratios;
    $scope.finished = false;
    $scope.thumb_container_styles = {};
    $scope.imageData = imageData;

    if (!$scope.image) {
      $scope.image = null;
      BettyCropper.get(imageData.id).then(function (success) {
        $scope.image = success.data;
      });
    }

    $scope.$watch('image', function (image) {
      if (!image) {
        return;
      }

      var finished = true;
      for (var ratio in image.selections) {
        if (image.selections[ratio].source === 'auto') {
          finished = false;
          break;
        }
      }
      $scope.finished = finished;

      $scope.scaleData = image.scaleToFit(550, 400);

      angular.element('.crop-image-container img').one('load', function () {
        $(this).Jcrop({
          allowSelect: false,
          allowMove: true,
          allowResize: true,
          keySupport: false
        }, function () {
          $scope.jcrop_api = this;
        });
      });

      $scope.image_url = image.url('original', DEFAULT_IMAGE_WIDTH, 'jpg');
      if (!$scope.ratios) {
        $scope.ratios = Object.keys(image.selections);
      }

      $scope.setThumbStyles();
    });

    $scope.$watch('selectedCrop', function (crop) {
      if (!$scope.image) {
        return;
      }
      var finished = true;
      for (var ratio in $scope.image.selections) {
        if ($scope.image.selections[ratio].source === 'auto' && ratio !== crop) {
          finished = false;
          break;
        }
      }
      $scope.finished = finished;
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
      var selection = $scope.image.selections[ratio].scaleBy($scope.scaleData.scale);

      if ($scope.jcrop_api) {
        $scope.jcrop_api.setOptions({
          aspectRatio: selection.width() / selection.height()
        });

        $scope.jcrop_api.setSelect([
          selection.x0,
          selection.y0,
          selection.x1,
          selection.y1
        ]);
      }

      $scope.cropMode = true;
      $scope.selectedCrop = ratio;
    };

    $scope.setThumbStyles = function () {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in $scope.image.selections) {
        var scaledSelection = $scope.image.selections[ratio].scaleToFit(170, 170);
        $scope.thumb_container_styles[ratio] = {
          'padding-top': Math.round((180 - scaledSelection.height()) / 2) + 'px',
          'padding-bottom': '5px',
          'padding-left':  Math.round((180 - scaledSelection.width()) / 2) + 'px',
          'padding-right': '5px'
        };

        $scope.thumb_styles[ratio] = $scope.image.getStyles(170, 170, ratio);
      }
    };

    $scope.save = function (ratio) {

      var jcrop_selection = $scope.jcrop_api.tellSelect();

      var newSelection = new Selection({
        x0: jcrop_selection.x,
        x1: jcrop_selection.x2,
        y0: jcrop_selection.y,
        y1: jcrop_selection.y2,
        source: 'user'
      });
      newSelection = newSelection.scaleBy(1 / $scope.scaleData.scale);
      if (newSelection.x1 > $scope.image.width) {
        newSelection.x1 = $scope.image.width;
      }
      if (newSelection.y1 > $scope.image.height) {
        newSelection.y1 = $scope.image.height;
      }

      return this.image.updateSelection(ratio, newSelection);
    };

    $scope.saveAndQuit = function () {
      var ratio = $scope.selectedCrop;
      this.save(ratio).then(function (success) {
        var ratio = success.data[0];
        var selection = success.data[1];
        $scope.image.selections[ratio] = selection;
      });
      $scope.cropMode = false;
      $modalInstance.close(imageData);
    };

    $scope.saveAndNext = function () {
      var ratio = $scope.selectedCrop;
      this.save(ratio).then(function (success) {
        var ratio = success.data[0];
        var selection = success.data[1];
        $scope.image.selections[ratio] = selection;

        var nextRatioIndex = ($scope.ratios.indexOf(ratio) + 1) % $scope.ratios.length;

        $scope.selectCrop($scope.ratios[nextRatioIndex]);
      });
    };

  });
