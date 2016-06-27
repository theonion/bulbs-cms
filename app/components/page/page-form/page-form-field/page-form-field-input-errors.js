'use strict';

angular.module('bulbs.cms.page.form.input.errors', [
  'bulbs.cms.site.config'
])
  .directive('pageFormFieldInputErrors', [
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
          'page',
          'page-form',
          'page-form-field',
          'page-form-field-input-errors.html'
        )
      };
    }
  ]);
