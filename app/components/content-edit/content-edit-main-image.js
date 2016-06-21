'use strict';

angular.module('bulbs.cms.content.edit.mainImage', [
  'BettyCropper',
  'bulbs.cms.site.config'
])
  .directive('contentEditMainImage', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath('content-edit/content-edit-main-image.html')
      };
    }
  ]);
