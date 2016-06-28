'use strict';

angular.module('bulbs.cms.dynamicContent.form', [
  'bulbs.cms.dynamicContent.api',
  'bulbs.cms.dynamicContent.form.field.text',
  'bulbs.cms.site.config',
  'lodash'
])
  .constant('DIRECTIVE_NAMES_MAP', {
    text: 'dynamic-content-form-field-text'
  })
  .directive('dynamicContentForm', [
    '_', '$compile', 'CmsConfig', 'DIRECTIVE_NAMES_MAP',
    function (_, $compile, CmsConfig, DIRECTIVE_NAMES_MAP) {

      var DynamicContentFormError = BulbsCmsError.build('<dynamic-content>');
      var getTemplate = function (name) {
        return CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          name
        );
      };

      return {
        controller: [
          '$scope', 'DynamicContentApi',
          function ($scope, DynamicContentApi) {
            if (!_.isString($scope.schemaSrc)) {
              throw new DynamicContentFormError('must be provided a schema url!');
            }

            if (!_.isObject($scope.values)) {
              throw new DynamicContentFormError('must be provided a value object!');
            }

            $scope.template = getTemplate('dynamic-content-form-loading.html');
            $scope.schema = {};

            DynamicContentApi.retrieveSchema($scope.schemaSrc)
              .then(function (schema) {
                $scope.template = getTemplate('dynamic-content-form-loaded.html');
                $scope.schema = schema;
              })
              .catch(function () {
                $scope.template = getTemplate('dynamic-content-form-error.html');
                $scope.errorMessage = 'Unable to retrieve schema';
              });
          }
        ],
        link: function (scope, element) {
          var $form = element.find('form');
          var fields = {};

          scope.$watch('schema', function () {
            Object.keys(scope.schema).forEach(function (id) {
              var fieldType = scope.schema[id].field_type;
              var tagName = DIRECTIVE_NAMES_MAP[fieldType];

              if (_.isUndefined(tagName)) {
                throw new DynamicContentFormError('"' + fieldType + '" is not a valid field type!');
              }

              if (!_.has(fields, id)) {
                var html = angular.element('<' + tagName + '></' + tagName + '>');
                html.attr('name', id);
                html.attr('schema', 'schema.' + id);
                html.attr('ng-model', 'values.' + id);

                $form.append(html);
                $compile(html)(scope);
                fields[id] = html;
              }
            });
          }, true);
        },
        restrict: 'E',
        scope: {
          schemaSrc: '@',
          values: '='
        },
        template: '<ng-include src="template"></ng-include>'
      };
    }
  ]);
