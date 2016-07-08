'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.dateTime', [
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldDateTime', [
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
          'dynamic-content-form-field-date-time',
          'dynamic-content-form-field-date-time.html'
        )
      };
    }
  ]);
