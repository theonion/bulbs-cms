'use strict';

angular.module('bulbs.cms.dynamicContent.form', [
  'bulbs.cms.dynamicContent.api',
  'bulbs.cms.dynamicContent.form.field.object',
  'bulbs.cms.site.config',
  'lodash'
])
  .directive('dynamicContentForm', [
    '_', 'CmsConfig',
    function (_, CmsConfig) {

      var DynamicContentFormError = BulbsCmsError.build('<dynamic-content>');
      var template = function (name) {
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

            if (!_.isObject($scope.ngModel)) {
              throw new DynamicContentFormError('must be provided an object for ng-model!');
            }

            $scope.template = template('dynamic-content-form-loading.html');
            $scope.schema = {};
            $scope.validityCallback = function (isValid) {
              $scope.onValidityChange({ isValid: isValid });
            };

            DynamicContentApi.retrieveSchema($scope.schemaSrc)
              .then(function (response) {
                $scope.template = template('dynamic-content-form-loaded.html');
                $scope.schema = response.data;
              })
              .catch(function () {
                $scope.template = template('dynamic-content-form-error.html');
                $scope.errorMessage = 'Unable to retrieve schema';
              });
          }
        ],
        require: 'ngModel',
        restrict: 'E',
        scope: {
          schemaSrc: '@',
          ngModel: '=',
          onValidityChange: '&',
          includeOnly: '='
        },
        template: '<ng-include src="template"></ng-include>'
      };
    }
  ]);
