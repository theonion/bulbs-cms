'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($window, $modal, routes) {
    var openImageCropModal = function (image) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + "image-crop-modal.html",
        controller: 'ImageCropModalCtrl',
        resolve: {
          img_ref: function () { return image; }
        }
      }).result;

    };
    $window.openImageCropModal = openImageCropModal; // for editor inline images
    return openImageCropModal;
  });
