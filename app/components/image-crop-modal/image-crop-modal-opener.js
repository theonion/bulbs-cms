'use strict';

angular.module('bulbs.cms.imageCropModal.opener', [
  'bulbs.cms.imageCropModal.controller',
  'bulbs.cms.site.config',
  'ui.bootstrap.modal'
])
  .factory('openImageCropModal', [
    '$modal',
    function ($modal) {

      var openImageCropModal = function (imageData, ratios) {

        return $modal.open({
          templateUrl: CmsConfig.buildComponentPath(
            'image-crop-modal',
            'image-crop-modal.html'
          ),
          controller: 'ImageCropModalCtrl',
          resolve: {
            imageData: function () { return imageData; },
            ratios: function () { return ratios || false; }
          },
          backdrop: 'static'
        }).result;
      };

      return openImageCropModal;
    }
  ]);
