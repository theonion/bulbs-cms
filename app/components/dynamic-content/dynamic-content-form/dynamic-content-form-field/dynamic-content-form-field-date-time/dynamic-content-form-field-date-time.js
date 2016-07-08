'use strict';

// nothing
angular.module('bulbs.cms.dynamicContent.form.field.dateTime', [
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
          'dynamic-content-form-field-field-date-time',
          'dynamic-content-form-field-field-date-time.html'
        )
      };
    }
  ]);
