'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.integer', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors'
])
  .directive('dynamicContentFormFieldInteger', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          uuid: '@',
          name: '@',
          ngModel: '=',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-integer',
          'dynamic-content-form-field-integer.html'
        ),
        link: function (scope, element, attr, ctrls) {
          var formField = ctrls[1][scope.name];
          formField.$validators.integer = function (modelValue) {
            if (!modelValue) {
              return true;
            } else {
              return parseInt(modelValue, 10) === modelValue;
            }
          };
        }
      };
    }
  ]);
