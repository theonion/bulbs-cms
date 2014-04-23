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
          var jcrop_api;
          $scope.thumb_width = 180;
          $scope.crop_image_width = 550;
          $scope.thumb_url = $bettycropper.orig_jpg(id, $scope.thumb_width);
          $scope.image_url = $bettycropper.orig_jpg(id, $scope.crop_image_width);

          $bettycropper.detail(id)
            .success(function (data) {
              $scope.image = data;
              $scope.computeRatioStyles($scope.image, $scope.image.selections);

              $('#crop-image').Jcrop({
                onSelect: function () {console.log('onSelect')},
                allowMove: true,
                allowResize: true,
                keySupport: false
              }, function () { // Jcrop Init Callback

                // NOTE: Maybe 16x9 shouldn't be hard-coded?

                jcrop_api = this;
                jcrop_api.setOptions({
                  aspectRatio: 16/9
                });

                var scale = $scope.crop_image_width / $scope.image.width;
                var s = $scope.image.selections['16x9'];
                jcrop_api.setSelect([
                  $scope.scaleNumber(s.x0, scale),
                  $scope.scaleNumber(s.y0, scale),
                  $scope.scaleNumber(s.x1, scale),
                  $scope.scaleNumber(s.y1, scale)
                ]);

              });

            });

          // Don't understand why I can't do currSelection = {ratio: selection}
          // in the ng-click handler...
          $scope.setCurrSelection = function (ratio, selection) {
            $scope.currSelection = [ratio, selection];
          };

          $scope.$watch('currSelection', function (newVal) {
            if (typeof(newVal) === 'undefined') {  return;  }

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

          $scope.computeRatioStyles = function (image, selections) {
            $scope.ratio_styles = $scope.ratio_styles || {};
            var scale = $scope.thumb_width / image.width;

            for (var s in selections) {
              var top, right, bottom, left;

              top = $scope.scaleNumber(selections[s].y0, scale);
              left = $scope.scaleNumber(selections[s].x0, scale);
              right = $scope.scaleNumber(image.width - selections[s].x1, scale);
              bottom = $scope.scaleNumber(image.height - selections[s].y1, scale);

              var margin = '-'+top+'px -'+right+'px -'+bottom+'px -'+left+'px';

              $scope.ratio_styles[s] = {
                margin: margin
              };
            }
          };

          $scope.scaleNumber = function (num, by_scale) {
            return Math.floor(num * by_scale);
          };

          $scope.close = function () {
            $modalInstance.close();
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

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
  });

