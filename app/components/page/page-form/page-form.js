'use strict';

angular.module('bulbs.cms.page.form', [
  'bulbs.cms.page.form.field.text',
  'lodash'
])
  .constant('DIRECTIVE_NAMES_MAP', {
    text: 'page-form-field-text'
  })
  .directive('pageForm', [
    '_', '$compile', 'DIRECTIVE_NAMES_MAP',
    function (_, $compile, DIRECTIVE_NAMES_MAP) {

      var error = BulbsCmsError.build('<page-form>');

      return {
        link: function (scope, element) {
          var $form = element.find('form');
          var fields = {};

          scope.$watch('pageData', function () {
            Object.keys(scope.pageData.fields).forEach(function (id) {
              var fieldType = scope.pageData.fields[id].field_type;
              var tagName = DIRECTIVE_NAMES_MAP[fieldType];

              if (_.isUndefined(tagName)) {
                throw new error('"' + fieldType + '" is not a valid field type!');
              }

              if (!_.has(fields, id)) {
                var html = angular.element('<' + tagName + '></' + tagName + '>');
                html.attr('name', id);
                html.attr('schema', 'pageData.fields.' + id);
                html.attr('ng-model', 'pageData.values.' + id);

                $form.append(html);
                $compile(html)(scope);
                fields[id] = html;
              }
            });

            // remove fields from html that are no longer listed in pageData
            _.difference(
              Object.keys(fields),
              Object.keys(scope.pageData.fields)
            ).forEach(function (removedFieldName) {
              fields[removedFieldName].remove();
            });
          }, true);
        },
        restrict: 'E',
        scope: {
          pageData: '='
        },
        template: '<form name="pageForm"></form>'
      };
    }
  ]);
