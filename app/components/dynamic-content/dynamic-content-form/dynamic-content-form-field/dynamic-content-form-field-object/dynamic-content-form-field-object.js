
'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.object', [
  'bulbs.cms.dynamicContent.form.field.list',
  'bulbs.cms.dynamicContent.form.field.text',
  'bulbs.cms.dynamicContent.form.field.color',
  'bulbs.cms.dynamicContent.form.types',
  'bulbs.cms.site.config',
  'lodash'
])
  .directive('dynamicContentFormFieldObject', [
    '_', '$compile', 'CmsConfig', 'FIELD_TYPES_META',
    function (_, $compile, CmsConfig, FIELD_TYPES_META) {
      var DynamicContentFormFieldObjectError = BulbsCmsError.build('<dynamic-content-form-field-object>');

      return {
        link: function (scope, element, attrs) {
          var $form = element.find('ng-form');

          scope.$watch('form.$valid', function (isValid) {
            scope.onValidityChange({ isValid: isValid });
          });

          scope.$watch('schema', function () {
            if (_.has(scope.schema, 'fields')) {
              Object.keys(scope.schema.fields).forEach(function (id) {
                var fieldSchema = scope.schema.fields[id];
                var fieldMeta = FIELD_TYPES_META[fieldSchema.type];

                if (_.isUndefined(fieldMeta)) {
                  if (_.has(fieldSchema, 'fields')) {
                    fieldMeta = FIELD_TYPES_META.object;
                  } else {
                    throw new DynamicContentFormFieldObjectError('"' + fieldSchema.type + '" is not a valid field type!');
                  }
                }

                if (_.isUndefined(scope.ngModel[id])) {
                  throw new DynamicContentFormFieldObjectError('"' + id + '" has no matching value!');
                }

                var tagName = fieldMeta.tagName;
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
          schema: '=',
          ngModel: '=',
          onValidityChange: '&'
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-object',
          'dynamic-content-form-field-object.html'
        )
      };
    }
  ]);
