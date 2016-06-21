'use strict';

angular.module('bulbs.cms.content.edit.body', [
  'bulbs.cms.site.config'
])
  .directive('contentEditBody', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope) {
          scope.inlineObjectsUrl = CmsConfig.getInlineObjecsPath();
        },
        restrict: 'E',
        scope: {
          article: '=',
          linkDomain: '@',
          searchHandler: '@'
        },
        templateUrl: CmsConfig.buildComponentPath('content-edit/content-edit-body.html')
      };
    }
  ]);
