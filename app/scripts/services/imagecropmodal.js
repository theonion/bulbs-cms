'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($document, $compile, $rootScope) {
    return function (id) {
      var el = $compile(
        "<ng-image-crop-modal image-id="+ id +"></ng-image-crop-modal>"
      )($rootScope);
      $document.find('body').append(el);
    };
  })
  .directive('ngImageCropModal', function ($modal, routes) {
    return {
      restrict: 'E',
      scope: {
        imageId: "="
      },
      link: function (scope, element, attrs) {
        var ModalInstanceCtrl = function ($scope, $interpolate, $bettycropper, $modalInstance, id) {
          var jcrop_api, ratioOrder;
          $scope.thumb = {height:180, width: 180};
          $scope.crop_image_width = 550;
          $scope.image_url = $bettycropper.orig_jpg(id, $scope.crop_image_width);

          var setupCropperCallback = function (data) {
            $scope.image = data;
            $scope.setThumbStyles($scope.image, $scope.image.selections);
            ratioOrder = Object.keys($scope.image.selections);

            $('#crop-image').Jcrop({
              allowSelect: false,
              allowMove: true,
              allowResize: true,
              keySupport: false
            }, function () { // Jcrop Init Callback
              jcrop_api = this;
              $scope.selectedCrop = [
                ratioOrder[0],
                $scope.image.selections[ratioOrder[0]]
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
              $scope.computeThumbStyle(
                $scope.image,
                $scope.selectedCrop[0],
                selection
              );
            }
          };

          // Don't understand why I can't do selectedCrop = {ratio: selection}
          // in the ng-click handler...
          $scope.setSelectedCrop = function (ratio, selection) {
            $scope.selectedCrop = [ratio, selection];
          };

          $scope.$watch('selectedCrop', function (newVal) {
            if (angular.isUndefined(newVal)) {  return;  }

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

            for (var s in selections) {
              $scope.computeThumbStyle(image, s, selections[s]);
            }
          };

          $scope.computeThumbStyle = function (image, ratio, selection) {
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
            scale = $scope.thumb[h_or_w] / selection_length;
            styles['background'] = 'url('+$scope.image_url+')';
            styles['background-size'] = $scope.scaleNumber($scope.image.width, scale) + 'px';
            styles['background-position'] = '' +
              '-' + $scope.scaleNumber(selection.x0, scale) +'px ' +
              '-' + $scope.scaleNumber(selection.y0, scale) + 'px';
            styles['background-repeat'] = 'no-repeat';
            styles['height'] = $scope.scaleNumber(s_height, scale) + 'px';
            styles['width'] = $scope.scaleNumber(s_width, scale) + 'px';

            $scope.thumb_styles[ratio] = styles;
          };

          $scope.scaleNumber = function (num, by_scale) {
            return Math.floor(num * by_scale);
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.save = function () {
            // Should probably use a save directive here
            $scope.processJcropSelection(jcrop_api.tellSelect());
            $bettycropper.update_selection(
              $scope.image.id,
              $scope.selectedCrop[0],
              $scope.image.selections[$scope.selectedCrop[0]]
            ).success(function (data) {
            });
          };

          $scope.saveAndNext = function () {
            $scope.processJcropSelection(jcrop_api.tellSelect());
            $bettycropper.update_selection(
              $scope.image.id,
              $scope.selectedCrop[0],
              $scope.image.selections[$scope.selectedCrop[0]]
            ).success(function (data) {
              var next = ratioOrder.indexOf($scope.selectedCrop[0]) + 1;
              if (next >= ratioOrder.length) {
                next = 0;
              }
              $scope.selectedCrop = [
                ratioOrder[next],
                $scope.image.selections[ratioOrder[next]]
              ];
            });

          };

          $bettycropper.detail(id)
            .success(setupCropperCallback);

        };

        $modal.open({
          templateUrl: routes.PARTIALS_URL + "image-crop-modal.html",
          controller: ModalInstanceCtrl,
          resolve: {
            id: function () { return scope.imageId; }
          }
        })
        .result
          .finally(function () {
            element.remove();
          })

      }
    };
  })
