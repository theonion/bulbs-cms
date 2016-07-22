'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.list', [
  'bulbs.cms.dynamicContent.form.field.object',
  'bulbs.cms.dynamicContent.form.input.label',
  'bulbs.cms.dynamicContent.form.types',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'lodash'
])
  .directive('dynamicContentFormFieldList', [
    'CmsConfig', 'FIELD_TYPES_META', 'Utils',
    function (CmsConfig, FIELD_TYPES_META, Utils) {
      return {
        controller: [
          '_', '$scope',
          function (_, $scope) {
            if (_.isUndefined($scope.ngModel[$scope.name])) {
              $scope.ngModel[$scope.name] = [];
            }

            $scope.itemOrderingMemory = [];
            $scope.redoOrdering = function () {
              $scope.itemOrderingMemory = $scope.ngModel[$scope.name].map(function (v, i) {
                return i + 1;
              });
            };
            $scope.redoOrdering();

            $scope.newItem = function () {
              if ($scope.readOnly) {
                return;
              }
              $scope.ngModel[$scope.name].push({});
              $scope.redoOrdering();
            };

            $scope.moveItem = function (fromIndex, toIndex) {
              Utils.moveTo($scope.ngModel[$scope.name], fromIndex, toIndex, true);

              $scope.redoOrdering();
            };

            $scope.removeItem = function (index) {
              Utils.removeFrom($scope.ngModel[$scope.name], index);

              $scope.redoOrdering();
            };
          }
        ],
        link: function (scope, elements, attrs, ctrls) {
          scope.form = ctrls[1];

          if (scope.ngModel[scope.name].length === 0) {
            scope.newItem();
          }
        },
        require: ['ngModel', '^^form'],
        restrict: 'E',
        scope: {
          name: '@',
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
