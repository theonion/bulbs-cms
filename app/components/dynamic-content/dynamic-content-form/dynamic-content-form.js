'use strict';

angular.module('bulbs.cms.page.form', [
  'bulbs.cms.page.api',
  'bulbs.cms.page.form.field.text',
  'bulbs.cms.site.config',
  'lodash'
])
  .constant('DIRECTIVE_NAMES_MAP', {
    text: 'page-form-field-text'
  })
  .directive('pageForm', [
    '_', '$compile', 'CmsConfig', 'DIRECTIVE_NAMES_MAP',
    function (_, $compile, CmsConfig, DIRECTIVE_NAMES_MAP) {

      var PageFormError = BulbsCmsError.build('<page-form>');
      var getTemplate = function (name) {
        return CmsConfig.buildComponentPath('page', 'page-form', name);
      };

      return {
        controller: [
          '$scope', 'PageApi',
          function ($scope, PageApi) {
            if (!_.isString($scope.schemaSrc)) {
              throw new PageFormError('must be provided a schema url!');
            }

            if (!_.isObject($scope.values)) {
              throw new PageFormError('must be provided a value object!');
            }

            $scope.template = getTemplate('page-form-loading.html');
            $scope.schema = {};

            PageApi.retrieveSchema($scope.schemaSrc)
              .then(function (schema) {
                $scope.template = getTemplate('page-form-loaded.html');
                $scope.schema = schema;
              })
              .catch(function () {
                $scope.template = getTemplate('page-form-error.html');
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
                throw new PageFormError('"' + fieldType + '" is not a valid field type!');
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
