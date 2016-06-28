'use strict';

angular.module('bulbs.cms.dynamicContent.form.input.errors', [
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldInputErrors', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        link: function (scope, element, attrs, formCtrl) {
          scope.form = formCtrl;
        },
        require: '^^form',
        restrict: 'E',
        scope: {
          name: '@',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-input-errors.html'
        )
      };
    }
  ]);
