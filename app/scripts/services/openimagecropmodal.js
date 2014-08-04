'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($modal, routes) {
    var openImageCropModal = function (image, cropsToEdit) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'image-crop-modal.html',
        controller: 'ImageCropModalCtrl',
        resolve: {
          img_ref: function () { return image; },
          cropsToEdit: function () { return cropsToEdit || false; }
        },
        backdrop: 'static'
      }).result;

    };

    return openImageCropModal;
  });
