'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.contentReferences', [
  'bulbs.cms.dynamicContent.form.input.errors',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.recircChooser',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldContentReferences', [
    'CmsConfig',
    function (CmsConfig) {
      return {
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
          'dynamic-content-form-field-content-references',
          'dynamic-content-form-field-content-references.html'
        )
      };
    }
  ]);

