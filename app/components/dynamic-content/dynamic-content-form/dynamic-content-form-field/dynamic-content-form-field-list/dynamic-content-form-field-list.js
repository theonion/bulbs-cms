'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.list', [
  'bulbs.cms.dynamicContent.form.field.object'
])
  .directive('dynamicContentFormFieldList', [
    function () {
      return {
        link: function (scope, elements, attrs) {
          if (scope.ngModel.length === 0) {
            scope.ngModel.push({});
          }
        },
        require: 'ngModel',
        restrict: 'E',
        scope: {
          name: '@',
          schema: '=',
          ngModel: '='
        },
        template:
          '<dynamic-content-form-field-object ' +
              'ng-repeat="itemValues in ngModel" ' +
              'name="uuid" ' +        // TODO : fix this
              'schema="schema.fields" ' +
              'ng-model="itemValues">' +
          '</dynamic-content-form-field-object>'
      };
    }
  ]);
