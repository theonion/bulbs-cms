'use strict';

angular.module('content.edit.body', [
  'cms.config'
])
  .directive('contentEditBody', function (CmsConfig, COMPONENTS_URL) {
    return {
      link: function (scope) {
        scope.inlineObjectsUrl = CmsConfig.getInlineObjectsUrl();
      },
      restrict: 'E',
      scope: {
        article: '=',
        linkDomain: '@',
        searchHandler: '@'
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-body/content-edit-body.html'
    };
  });
