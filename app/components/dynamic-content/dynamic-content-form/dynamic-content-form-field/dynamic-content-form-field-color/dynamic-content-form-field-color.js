'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.color', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors'
])
  .directive('dynamicContentFormFieldColor', [
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
          'dynamic-content-form-field-color',
          'dynamic-content-form-field-color.html'
        ),
        link: function (scope, element, attr, ctrls) {
          var formField = ctrls[1][scope.name];
          formField.$validators.rgbhex = function (modelValue) {
            if (!modelValue) {
              return true;
            }
            else {
              return /^#[0-9a-fA-F]{6}$/.test(modelValue);
            }
          };
        }
      };
    }
  ]);
