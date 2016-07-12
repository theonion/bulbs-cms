'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.image', [
  'bettyEditable',
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.errors',
  'bulbs.cms.dynamicContent.form.input.label'
])
  .directive('dynamicContentFormFieldImage', [
    'CmsConfig',
    function (CmsConfig) {

      return {
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          name: '@',
          ngModel: '=',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-image',
          'dynamic-content-form-field-image.html'
        )
      };
    }
  ]);
