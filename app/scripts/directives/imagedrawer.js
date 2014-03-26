'use strict';

angular.module('bulbsCmsApp')
  .directive('imagedrawer', function ($http, $window) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'imagedrawer.html',
      scope: {
        openImageDrawer: '=',
        closeImageDrawer: '=',
        article: '='
      },
      controller: function ($scope) {
        /*openImageDrawer and closeImageDrawer are accessible in parent scope
        both take care of
          opening the drawer
          binding/unbinding upload, hover, and click events to modify the target image
        */

        $scope.current_image = {};
        $scope.$watch('current_image', function () {
          $scope.library_images = prependCurrentImage($scope.library_images, $scope.current_image);
        });
        $scope.library_images = [];

        var prependCurrentImage = function (library, current_image) {
          var new_library = library;
          if (current_image.id) {
            for (var i in new_library) {
              if (new_library[i].id === current_image.id) {
                new_library.splice(i, 1);
                break;
              }
            }

            new_library.unshift(current_image);
          }

          return new_library;
        };
        var refreshImageLibrary = function (params) {
          //TODO: this is shiiiite. currently just bulldozes old data
          //which makes ng-repeat fully refresh the library
          //can make this a lot smarter
          params = params || {};
          $http({
            method: 'GET',
            url: $window.BC_ADMIN_URL + '/api/search',
            params: params,
            headers: {'X-Betty-Api-Key': 'c44027184faf2dc61d6660409dec817daaa75decfa853d68250cbe8e'}
          }).success(function (data) {
            $scope.library_images = prependCurrentImage(data.results, $scope.current_image);
          });
        };

        $scope.drawerUpload = function () {
          $window.uploadImage({
            onProgress: function () {},
            onSuccess: function (data) {
              refreshImageLibrary();
              $scope.onChangeFn(data);
              $scope.current_image = data;
            },
            onError: $scope.onCancelFn,
            onCancel: $scope.onCancelFn
          });
        };

        var refreshCurrentImage = function (id, field) {
          $http({
            url: $window.BC_ADMIN_URL + '/api/' + id,
            method: 'GET',
            headers: {'X-Betty-Api-Key': 'c44027184faf2dc61d6660409dec817daaa75decfa853d68250cbe8e'}
          }).success(function (data) {
            if (field) {
              $scope.current_image[field] = data[field];
            } else {
              $scope.current_image = data;
            }
            $window.picturefill(true);
          }).error(function (data) {
            $scope.current_image = {};
          });
        };
        $window.refreshCurrentImage = refreshCurrentImage;


        $scope.$watch('imageLibrarySearch', function () {
          refreshImageLibrary({'q': $scope.imageLibrarySearch});
        });

        $scope.openImageDrawer = function () {
          var oldId, onChangeFn, onSaveFn, onCancelFn;
          if (typeof(arguments[0]) === 'function') {
            oldId = null;
            onChangeFn = arguments[0];
            onSaveFn = arguments[1];
            onCancelFn = arguments[2];
          } else {
            oldId = arguments[0];
            onChangeFn = arguments[1];
            onSaveFn = arguments[2];
            onCancelFn = arguments[3];
          }
          $('#image-drawer').off('click');
          $('#image-drawer').on('click', '#image-library.image', function () {
            var id = $(this).data('imageId');
            refreshCurrentImage(id);
            onChangeFn(id);
          });

          if (oldId) {
            $scope.original_image = oldId;
          }
          refreshCurrentImage(oldId);

          $scope.oldId = oldId;
          $scope.onChangeFn = onChangeFn;
          $scope.onSaveFn = onSaveFn;
          $scope.onCancelFn = function (id) {
            if ($scope.original_image) {
              refreshCurrentImage($scope.original_image);
            }
            onCancelFn(id);
          };

          $('body').addClass('image-drawer-cropper-open');
          refreshImageLibrary();
        };
        $window.openImageDrawer = $scope.openImageDrawer;

        $scope.openImageLibrary = function () {
          $scope.libraryOpen = true;
          $('body').addClass('image-drawer-library-open');
          $window.picturefill(true);
        };

        $scope.closeImageDrawer = function () {
          $('body').removeClass('image-drawer-cropper-open');
          $('body').removeClass('image-drawer-library-open');
          $window.picturefill();
        };

        $scope.closeImageLibrary = function (action) {
          if (action === 'save') {
            $scope.onSaveFn();
          }
          if (action === 'cancel') {
            $scope.onCancelFn($scope.oldId);
          }
          $('body').removeClass('image-drawer-library-open');
          $scope.libraryOpen = false;
        };

        $scope.saveImageData = function (e) {
          $window.saveImageData(e);
        };

        $scope.saveNewCrop = function (image, ratio) {
          image.selections[ratio] = {
            'x0': user_selection_scaled[0],
            'y0': user_selection_scaled[1],
            'x1': user_selection_scaled[2],
            'y1': user_selection_scaled[3]
          };
          $scope.$apply();

          $window.saveNewCrop(
            image,
            ratio,
            user_selection_scaled,
            {
              onSuccess: function () {
                refreshCurrentImage(image.id, 'selections');
              }
            }
          );
        };

        var jcrop_api, user_selection, user_selection_scaled;

        $('#cropperModal').on('hidden.bs.modal', function () {
          jcrop_api.destroy();
        });
        $('#cropperModal').on('shown.bs.modal', function () {
          $window.picturefill();
        });

        function scaleSelection(scale, selection) {
          return [parseInt(scale * selection[0]), parseInt(scale * selection[1]), parseInt(scale * selection[2]), parseInt(scale * selection[3])];
        }

        $scope.cropImage = function (image, ratio) {
          var width = 500;
          $('#cropper-img').attr('src', IMAGE_SERVER_URL + '/' + image.id + '/original/' + width + '.jpg');

          var aspectWidth = ratio.split('x')[0];
          var aspectHeight = ratio.split('x')[1];
          var scale = width / image.width;
          var selection = [image.selections[ratio].x0, image.selections[ratio].y0, image.selections[ratio].x1, image.selections[ratio].y1];

          var onSelect = function (c) {
            var selection = [c.x, c.y, c.x2, c.y2];
            user_selection = selection;
            user_selection_scaled = scaleSelection((1 / scale), selection);
          };

          $('#cropper-modal-save-button').unbind('click');
          $('#cropper-modal-save-button').click(function () {
            $scope.saveNewCrop(image, ratio);
          });
          $('#cropperModal').modal('show');

          $('#cropper-img').Jcrop({
            onSelect: onSelect,
            allowMove: true,
            allowResize: true,
            aspectRatio: aspectWidth / aspectHeight
          }, function () {
            jcrop_api = this;

            jcrop_api.setOptions({aspectRatio: aspectWidth / aspectHeight});
            this.focus();
            var s = scaleSelection(scale, selection);
            this.setSelect(scaleSelection(scale, selection));
          });
        };

      },
      link: function (scope, element, attrs) {
        //hidden file input click
        scope.IMAGE_SERVER_URL = $window.IMAGE_SERVER_URL;

        function preventDefault(e) {
          e = e || window.event;
          if (e.preventDefault) { e.preventDefault(); }
          e.returnValue = false;
        }

        document.getElementById('image-cropper').onmousewheel = function (e) {
          document.getElementById('image-cropper').scrollTop -= e.wheelDeltaY;
          preventDefault(e);
        };
        document.getElementById('image-library-body').onmousewheel = function (e) {
          document.getElementById('image-library-body').scrollTop -= e.wheelDeltaY;
          preventDefault(e);
        };


      }

    };
  });
