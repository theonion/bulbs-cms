'use strict';

angular.module('bulbs.cms.dynamicContent.form', [
  'bulbs.cms.dynamicContent.api',
  'bulbs.cms.dynamicContent.form.field.text',
  'bulbs.cms.site.config',
  'lodash'
])
  .directive('dynamicContentForm', [
    '_', '$compile', 'CmsConfig',
    function (_, $compile, CmsConfig) {

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
