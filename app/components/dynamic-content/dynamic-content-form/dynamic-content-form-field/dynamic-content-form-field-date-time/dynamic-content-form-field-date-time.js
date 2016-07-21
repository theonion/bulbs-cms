'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.dateTime', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.input.errors',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldDateTime', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        controller: [
          '$scope',
          function ($scope) {
            $scope.setDate = function (newDate) {
              $scope.ngModel[$scope.name] = newDate.format();
            };

            $scope.clearDate = function () {
              $scope.ngModel[$scope.name] = null;
            };
          }
        ],
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          uuid: '@',
          name: '@',
          ngModel: '=',
          schema: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-date-time',
          'dynamic-content-form-field-date-time.html'
        )
      };
    }
  ]);
