'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.object', [
  'bulbs.cms.dynamicContent.form.field.list',
  'bulbs.cms.dynamicContent.form.field.text',
  'bulbs.cms.site.config',
  'lodash'
])
  .constant('DIRECTIVE_NAMES_MAP', {
    text: 'dynamic-content-form-field-text',
    array: 'dynamic-content-form-field-list'
  })
  .directive('dynamicContentFormFieldObject', [
    '_', '$compile', 'DIRECTIVE_NAMES_MAP',
    function (_, $compile, DIRECTIVE_NAMES_MAP) {
      var DynamicContentFormFieldObjectError = BulbsCmsError.build('<dynamic-content-form-field-object>');

      return {
        link: function (scope, element, attrs) {
          var $form = element.find('ng-form');

          scope.$watch('schema', function () {
            if (_.has(scope.schema, 'fields')) {
              Object.keys(scope.schema.fields).forEach(function (id) {
                var fieldType = scope.schema.fields[id].field;
                var tagName = DIRECTIVE_NAMES_MAP[fieldType];

                if (_.isUndefined(tagName)) {
                  throw new DynamicContentFormFieldObjectError('"' + fieldType + '" is not a valid field type!');
                }

                var html = angular.element('<' + tagName + '></' + tagName + '>');

                html.attr('name', id);
                html.attr('schema', 'schema.' + id);
                html.attr('ng-model', 'values.' + id);

                $form.append(html);
                $compile(html)(scope);
              });
            }
          }, true);
        },
        restrict: 'E',
        scope: {
          name: '@',
          schema: '=',
          values: '='
        },
        template: '<ng-form name="{{ name }}"></ng-form>'
      };
    }
  ]);
