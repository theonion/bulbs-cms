'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.text', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors',
  'OnionEditor'
])
  .directive('dynamicContentFormFieldText', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attr, ctrls) {
          scope.formField = ctrls[1][scope.name];
        },
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
          'dynamic-content-form-field-text',
          'dynamic-content-form-field-text.html'
        )
      };
    }
  ]);
