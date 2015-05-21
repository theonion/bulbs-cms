'use strict';

/**
 * Directive that will choose an edit template based on an article's polymorphic_ctype.
 */
angular.module('content.edit.templateChooser', [
  'cms.config'
])
  .directive('contentEditTemplateChooser', [
    'CmsConfig', 'routes',
    function (CmsConfig, routes) {
      var defaultView = routes.COMPONENTS_URL + 'content/content-edit/type-error.html';

      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        controller: function ($scope) {
          $scope.template = defaultView;
          try {
            $scope.template = CmsConfig.getEditPageTemplateUrl($scope.article.polymorphic_ctype);
          } catch (e) {
            $scope.error = e.message;
          }
        },
        template: '<div ng-include="template">Could not find template {{template}}</div>'
      };
    }]);
