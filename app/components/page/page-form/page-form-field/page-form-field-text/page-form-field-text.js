'use strict';

angular.module('bulbs.cms.page.form.field.text', [
  'bulbs.cms.site.config'
])
  .directive('pageFormFieldText', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        restrict: 'E',
        scope: {
          pageForm: '=',
          value: '=',
          schema: '=',
          name: '='
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
