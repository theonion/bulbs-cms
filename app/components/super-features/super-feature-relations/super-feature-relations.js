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

            $scope.addChildPage = function () {

              if (!$scope.addChildPageDisabled) {
                $scope.addChildPageDisabled = true;

                SuperFeaturesApi.createSuperFeature({
                  parent: $scope.article.id,
                  superfeature_type: $scope.article.default_child_type
                })
                  .then(function (child) {
                    $scope.relations.push(child);
                    $scope.redoOrdering();
                  })
                  .finally(function () {
                    $scope.addChildPageDisabled = false;
                  });
              }
            };

            $scope.ongoingChildTransactions = {};

            $scope.saveChildPage = function (relation) {

              if (!$scope.ongoingChildTransactions[relation.id]) {
                $scope.ongoingChildTransactions[relation.id] = true;

                SuperFeaturesApi.updateSuperFeature(relation)
                  .finally(function () {
                    $scope.ongoingChildTransactions[relation.id] = false;
                  });
              }
            };

            $scope.deleteChildPage = function (relation) {

              if (!$scope.ongoingChildTransactions[relation.id]) {
                $scope.ongoingChildTransactions[relation.id] = true;

                SuperFeaturesApi.deleteSuperFeature(relation)
                  .finally(function () {
                    $scope.ongoingChildTransactions[relation.id] = false;
                  });
              }
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
