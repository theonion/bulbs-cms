'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.text', [
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldDate', [
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
          'dynamic-content-form-field-field-date',
          'dynamic-content-form-field-field-date.html'
        )
      };
    }
  ]);
