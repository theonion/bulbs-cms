'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.object', [
  'bulbs.cms.dynamicContent.form.field.list',
  'bulbs.cms.dynamicContent.form.field.text',
  'bulbs.cms.site.config',
  'lodash'
])
  .constant('DIRECTIVE_NAMES_MAP', {
    array: 'dynamic-content-form-field-list',
    object: 'dynamic-content-form-field-object',
    text: 'dynamic-content-form-field-text'
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
                var fieldSchema = scope.schema.fields[id];
                var tagName = DIRECTIVE_NAMES_MAP[fieldSchema.type];

                if (_.isUndefined(tagName)) {
                  if (_.has(fieldSchema, 'fields')) {
                    tagName = DIRECTIVE_NAMES_MAP.object;
                  } else {
                    throw new DynamicContentFormFieldObjectError('"' + fieldSchema.type + '" is not a valid field type!');
                  }
                }

                var html = angular.element('<' + tagName + '></' + tagName + '>');

                html.attr('name', id);
                html.attr('schema', 'schema.fields.' + id);
                html.attr('ng-model', 'ngModel.' + id);

                $form.append(html);
                $compile(html)(scope);
              });
            }
          }, true);
        },
        require: 'ngModel',
        restrict: 'E',
        scope: {
          name: '@',
          schema: '=',
          ngModel: '='
        },
        template: '<ng-form name="{{ name }}"></ng-form>'
      };
    }
  ]);
