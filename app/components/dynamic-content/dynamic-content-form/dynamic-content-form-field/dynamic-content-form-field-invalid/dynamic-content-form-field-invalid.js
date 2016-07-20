'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.invalid', [
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldInvalid', [
    'CmsConfig',
    function (CmsConfig) {

      return {
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
          'dynamic-content-form-field-invalid',
          'dynamic-content-form-field-invalid.html'
        )
      };
    }
  ]);
