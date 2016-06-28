'use strict';

angular.module('bulbs.cms.page.form.field.text', [
  'bulbs.cms.site.config',
  'bulbs.cms.page.form.input.label',
  'bulbs.cms.page.form.input.errors'
])
  .directive('pageFormFieldText', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attrs, ctrls) {
          scope.form = ctrls[1];
        },
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          name: '@',
          ngModel: '=',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'page',
          'page-form',
          'page-form-field',
          'page-form-field-text',
          'page-form-field-text.html'
        )
      };
    }
  ]);
