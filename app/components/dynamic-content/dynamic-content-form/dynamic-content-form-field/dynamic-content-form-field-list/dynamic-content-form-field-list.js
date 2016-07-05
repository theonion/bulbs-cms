'use strict';

angular.module('bulbs.cms.dynamicContent.form.field.list', [
  'bulbs.cms.dynamicContent.form.field.object',
  'bulbs.cms.dynamicContent.form.types',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormFieldList', [
    'CmsConfig', 'FIELD_TYPES_META',
    function (CmsConfig, FIELD_TYPES_META) {
      return {
        controller: [
          '$scope',
          function ($scope) {
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
            };
          }
        ],
        link: function (scope, elements, attrs) {
          if (scope.ngModel.length === 0) {
            scope.newItem();
          }
        },
        require: 'ngModel',
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
