'use strict';

angular.module('bulbs.cms.dynamicContent.form.input.label', [])
  .directive('dynamicContentFormFieldInputLabel', [
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
