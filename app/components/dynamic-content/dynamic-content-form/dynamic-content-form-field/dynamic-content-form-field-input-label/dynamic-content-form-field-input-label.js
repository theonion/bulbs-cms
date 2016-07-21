'use strict';

angular.module('bulbs.cms.dynamicContent.form.input.label', [
  'bulbs.cms.site.config',
  'lodash'
])
  .directive('dynamicContentFormFieldInputLabel', [
    '_', 'CmsConfig',
    function (_, CmsConfig) {
      return {
        link: function (scope, element, attrs, formCtrl) {
          scope.form = formCtrl;

          scope.isEmpty = _.isEmpty;
        },
        require: '^^form',
        restrict: 'E',
        scope: {
          inputId: '@',
          name: '@',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-input-label',
          'dynamic-content-form-field-input-label.html'
        )
      };
    }
  ]);
