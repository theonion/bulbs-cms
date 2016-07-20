'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.choice', [
  'bulbs.cms.dynamicContent.form.input.errors',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldChoice', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope) {
          console.log(scope.schema)
        },
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
          'dynamic-content-form-field-choice',
          'dynamic-content-form-field-choice.html'
        )
      };
    }
  ]);
