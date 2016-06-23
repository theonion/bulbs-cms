'use strict';

angular.module('bulbs.cms.page.form.field', [
  'bulbs.cms.site.config'
])
  .directive('pageFormField', [
    '$compile', 'CmsConfig',
    function ($compile, CmsConfig) {
      var FieldMap = {
        text: 'page-form-field-text'
      };

      return {
        link: function (scope, element, attrs) {
          var directiveName = FieldMap[scope.schema.type];

          var html = angular.element('<' + directiveName + '></' + directiveName + '>');
          html.attr('page-form', scope.pageForm);
          html.attr('schema', scope.schema);
          html.attr('value', scope.value);

          var el = $compile(html)(scope);
          element.append(el);
        },
        restrict: 'E',
        scope: {
          name: '=',
          schema: '=',
          value: '=',
          pageForm: '='
        }
      };
    }
  ]);
