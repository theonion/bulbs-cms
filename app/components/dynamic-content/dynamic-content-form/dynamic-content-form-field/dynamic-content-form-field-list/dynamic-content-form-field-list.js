'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.list', [
  'bulbs.cms.dynamicContent.form.field.object'
])
  .directive('dynamicContentFormFieldList', [
    function () {
      return {
        link: function (scope, elements, attrs) {

        },
        restrict: 'E',
        scope: {
          name: '@',
          schema: '=',
          values: '='
        },
        template:
          '<dynamic-content-form-field-object ' +
              'ng-repeat="itemValues in values" ' +
              'name="uuid" ' +        // TODO : fix this
              'schema="schema.fields" ' +
              'values="itemValues">' +
          '</dynamic-content-form-field-object>'
      };
    }
  ]);
