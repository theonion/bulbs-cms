'use strict';

angular.module('bulbs.cms.page.form.input.label', [])
  .directive('pageFormFieldInputLabel', [
    function () {
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
        template: '<label for="{{ name }}">{{ schema.label }}</label>'
      };
    }
  ]);
