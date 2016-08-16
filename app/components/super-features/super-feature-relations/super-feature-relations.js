'use strict';

angular.module('bulbs.cms.superFeatures.relations', [
  'bettyEditable',
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'bulbs.cms.utils',
  'statusFilter.config'
])
  .directive('superFeatureRelations', [
    'CmsConfig', 'SuperFeaturesApi', 'StatusFilterOptions',
    function (CmsConfig, SuperFeaturesApi, StatusFilterOptions) {
      return {
        controller: [
          '_', '$scope', 'Utils',
          function (_, $scope, Utils) {

            $scope.itemOrderingMemory = [];
            $scope.redoOrdering = function () {
              $scope.itemOrderingMemory = $scope.relations.map(function (v, i) {
                return i + 1;
              });
            };

            $scope.newItem = function () {
              if ($scope.readOnly) {
                return;
              }
              $scope.relations.push({});
              $scope.redoOrdering();
            };

            $scope.moveItem = function (fromIndex, toIndex) {
              Utils.moveTo($scope.relations, fromIndex, toIndex, true);

              $scope.redoOrdering();
            };

            $scope.removeItem = function (index) {
              Utils.removeFrom($scope.relations, index);

              $scope.redoOrdering();
            };
          }
        ],
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {
          scope.statuses = StatusFilterOptions.getStatuses()
            .filter(function (status) {
              // remove default status
              return !!status.value;
            });

          SuperFeaturesApi.getSuperFeatureRelations(scope.article.id)
            .then(function (response) {
              scope.relations = response.data;
              scope.redoOrdering();
            });
        },
        templateUrl: CmsConfig.buildComponentPath(
          'super-features',
          'super-feature-relations',
          'super-feature-relations.html'
        )
      };
    }
  ]);
