'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($modal, routes) {
    var openImageCropModal = function (imageData, ratios) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'image-crop-modal.html',
        controller: 'ImageCropModalCtrl',
        resolve: {
          imageData: function () { return imageData; },
          ratios: function () { return ratios || false; }
        },
        backdrop: 'static'
      }).result;

    };

    return openImageCropModal;
  });
