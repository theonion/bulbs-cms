'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.text', [
  'bulbs.cms.site.config',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors',
  'jquery'
])
  .directive('dynamicContentFormFieldText', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attr, ctrls) {
          scope.formField = ctrls[1][scope.name];

          if (scope.schema.max_length > 0) {
            var input = element.find('input');
            input.css('width', scope.schema.max_length + 'em');

            if (element.width() <= input.width()) {
              input.css('width', '');
            }
          }
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
