'use strict';

angular.module('bulbs.cms.imageCropModal', [
  'bulbs.cms.imageCropModal.controller',
  'bulbs.cms.site.config',
  'ui.bootstrap.modal'
])
  .factory('openImageCropModal', [
    '$modal', 'CmsConfig',
    function ($modal, CmsConfig) {

      return function (imageData, ratios) {
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
    }
  ]);
