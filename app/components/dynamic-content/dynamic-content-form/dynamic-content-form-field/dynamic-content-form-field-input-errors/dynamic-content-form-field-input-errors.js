'use strict';

angular.module('bulbs.cms.dynamicContent.form.input.errors', [
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldInputErrors', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attrs, formCtrl) {
          scope.form = formCtrl[scope.name];

          scope.$watch(
            function () {
              return scope.form.$error;
            },
            function () {
              scope.errors = scope.form.$error;
            }
          );
        },
        require: '^^form',
        restrict: 'E',
        scope: {
          name: '@',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-input-errors',
          'dynamic-content-form-field-input-errors.html'
        )
      };
    }
  ]);
