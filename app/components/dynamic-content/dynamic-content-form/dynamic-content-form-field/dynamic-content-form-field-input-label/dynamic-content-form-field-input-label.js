'use strict';

angular.module('bulbs.cms.dynamicContent.form.input.label', [
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldInputLabel', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attrs, formCtrl) {

          scope.$watch(
            function () {
              return formCtrl[scope.name].$error;
            },
            function () {
              scope.hasErrors = Object.keys(formCtrl[scope.name].$error).length > 0;
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
          'dynamic-content-form-field-input-label',
          'dynamic-content-form-field-input-label.html'
        )
      };
    }
  ]);
