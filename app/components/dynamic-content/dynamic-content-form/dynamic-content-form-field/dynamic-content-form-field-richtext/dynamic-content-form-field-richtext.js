'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.richtext', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors',
  'OnionEditor'
])
  .directive('dynamicContentFormFieldRichtext', [
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
          'dynamic-content-form-field-richtext',
          'dynamic-content-form-field-richtext.html'
        )
      };
    }
  ]);
