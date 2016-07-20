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
              $scope.ngModel[name] = newDate.format();
            };

            $scope.clearDate = function () {
              $scope.ngModel[name] = null;
            };
          }
        ],
        link: function (scope, element, attrs, ctrls) {
          var ngModel = ctrls[0];

// TODO : wtf? why are there two of these?
          scope.clearDate = function () {
            ngModel.$setViewValue(null);
          };
        },
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
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
