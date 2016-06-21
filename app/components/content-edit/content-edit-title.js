'use strict';

angular.module('bulbs.cms.content.edit.title', [
  'bulbs.cms.site.config'
])
  .directive('contentEditTitle', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath('content-edit/content-edit-title.html')
      };
    }
  ]);
