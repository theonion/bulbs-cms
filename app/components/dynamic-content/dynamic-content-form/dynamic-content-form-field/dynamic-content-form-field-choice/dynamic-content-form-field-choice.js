'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.choice', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors'
])
  .directive('dynamicContentFormFieldChoice', [
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
          'dynamic-content-form-field-choice',
          'dynamic-content-form-field-choice.html'
        )
      };
    }
  ]);
