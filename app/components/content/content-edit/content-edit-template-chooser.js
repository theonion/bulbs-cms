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
        controller: function ($scope, $templateCache) {
          $scope.template = defaultView;
          try {
            var template = CmsConfig.getEditPageTemplateUrl($scope.article.polymorphic_ctype);

            // need this logic to prevent a stupid infinite redirect loop if template doesn't exist
            if ($templateCache.get(template)) {
              // template actually exists, use it
              $scope.template = template;
            } else {
              // we're headed to the error page, set hte error message
              $scope.error = 'Unable to find template for type "' + $scope.article.polymorphic_ctype + '"';
            }
          } catch (e) {
            $scope.error = e.message;
          }
        },
        template: '<div ng-include="template"></div>'
      };
    }]);
