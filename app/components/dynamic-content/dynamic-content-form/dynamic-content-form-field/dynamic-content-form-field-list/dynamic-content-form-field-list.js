'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.list', [
  'bulbs.cms.dynamicContent.form.field.object',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.types',
  'bulbs.cms.site.config',
  'bulbs.cms.utils'
])
  .directive('dynamicContentFormFieldList', [
    'CmsConfig', 'FIELD_TYPES_META', 'Utils',
    function (CmsConfig, FIELD_TYPES_META, Utils) {
      return {
        controller: [
          '$scope',
          function ($scope) {
            $scope.itemOrderingMemory = [];
            $scope.redoOrdering = function () {
              $scope.itemOrderingMemory = $scope.ngModel.map(function (v, i) {
                return i + 1;
              });
            };
            $scope.redoOrdering();

            $scope.newItem = function () {
              if ($scope.readOnly) {
                return;
              }

              var item = {};

              Object.keys($scope.schema.fields).forEach(function (key) {
                var type = $scope.schema.fields[key].type;
                item[key] = FIELD_TYPES_META[type].initialValue;
              });

              $scope.ngModel.push(item);

              $scope.redoOrdering();
            };

            $scope.moveItem = function (fromIndex, toIndex) {
              Utils.moveTo($scope.ngModel, fromIndex, toIndex, true);

              $scope.redoOrdering();
            };

            $scope.removeItem = function (index) {
              Utils.removeFrom($scope.ngModel, index);

              $scope.redoOrdering();
            };
          }
        ],
        link: function (scope, elements, attrs) {
          if (scope.ngModel.length === 0) {
            scope.newItem();
          }
        },
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          schema: '=',
          ngModel: '=',
          readOnly: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-field',
          'dynamic-content-form-field-list',
          'dynamic-content-form-field-list.html'
        )
      };
    }
  ]);
