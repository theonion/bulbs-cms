'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($window, $modal, routes) {
    var openImageCropModal = function (id) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + "image-crop-modal.html",
        controller: 'ImageCropModalCtrl',
        resolve: {
          id: function () { return id; }
        }
      }).result;

    };
    $window.openImageCropModal = openImageCropModal; // for editor inline images
    return openImageCropModal;
  });
