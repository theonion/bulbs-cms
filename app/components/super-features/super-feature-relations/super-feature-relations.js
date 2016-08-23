'use strict';

angular.module('bulbs.cms.superFeatures.relations', [
  'bettyEditable',
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'bulbs.cms.sendToEditorModal',
  'bulbs.cms.titleModal',
  'bulbs.cms.utils',
  'confirmationModal',
  'Raven',
  'statusFilter.config'
])
  .directive('superFeatureRelations', [
    'CmsConfig', 'Raven', 'SuperFeaturesApi', 'StatusFilterOptions',
    function (CmsConfig, Raven, SuperFeaturesApi, StatusFilterOptions) {
      return {
        controller: [
          '_', '$scope', 'Utils',
          function (_, $scope, Utils) {

            var relationFormPrefix = 'relationForm_';
            var orderingFormPrefix = 'orderingInputForm_';

            $scope.wrapperForm = {};
            $scope.makeRelationFormName = function (relation) {
              return relationFormPrefix + relation.id;
            };
            $scope.makeOrderingFormName = function (relation) {
              return orderingFormPrefix + relation.id;
            };
            $scope.getRelationForm = function (relation) {
              return $scope.wrapperForm[$scope.makeRelationFormName(relation)];
            };
            $scope.getOrderingForm = function (relation) {
              return $scope.wrapperForm[$scope.makeOrderingFormName(relation)];
            };

            $scope.isAtLeastOneRelationFormDirty = function () {
              return Object.keys($scope.wrapperForm)
                .reduce(function (isDirty, key) {
                  if (key.startsWith(relationFormPrefix)) {
                    return isDirty || $scope.wrapperForm[key].$dirty;
                  }
                  return isDirty;
                }, false);
            };

            $scope.redoOrdering = function () {
              $scope.relations.forEach(function (relation, i) {
                relation.order = i + 1;
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

            $scope.addChildPage = function (title) {

              if (!$scope.addChildPageDisabled) {
                $scope.addChildPageDisabled = true;

                SuperFeaturesApi.createSuperFeature({
                  parent: $scope.article.id,
                  superfeature_type: $scope.article.default_child_type,
                  title: title
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

            $scope.isAtLeastOneOngoingChildTransaction = function () {
              return Object.keys($scope.ongoingChildTransactions)
                .reduce(function (ongoing, relationId) {
                  return ongoing || $scope.ongoingChildTransactions[relationId];
                }, false);
            };

            $scope.updateChildPublishDates = function () {

              if (!$scope.isAtLeastOneOngoingChildTransaction() &&
                  !$scope.runningChildPublishDateUpdate) {

                $scope.runningChildPublishDateUpdate = true;

                SuperFeaturesApi
                  .updateAllRelationPublishDates($scope.article.id)
                  .catch(function (response) {
                    Raven.captureMessage(
                      'Error attempting to update all relation publish dates', {
                        response: response
                      }
                    );
                    $scope.errorMessage = 'An error occurred!';
                  })
                  .finally(function () {
                    $scope.runningChildPublishDateUpdate = false;
                  });
              }
            };

            $scope.saveChildPage = function (relation) {

              if (!$scope.ongoingChildTransactions[relation.id] &&
                  !$scope.runningChildPublishDateUpdate) {

                $scope.ongoingChildTransactions[relation.id] = true;

                var relationCopy = angular.copy(relation);
                relationCopy.order = relation.order - 1;

                SuperFeaturesApi.updateSuperFeature(relationCopy)
                  .finally(function () {
                    $scope.ongoingChildTransactions[relation.id] = false;
                    $scope.getRelationForm(relation).$setPristine();
                  });
              }
            };

            $scope.deleteChildPage = function (relation) {

              if (!$scope.ongoingChildTransactions[relation.id] &&
                  !$scope.runningChildPublishDateUpdate) {

                $scope.ongoingChildTransactions[relation.id] = true;

                SuperFeaturesApi.deleteSuperFeature(relation)
                  .then(function () {
                    $scope.removeItem($scope.relations.indexOf(relation));
                  })
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
              scope.relations = response.results.sort(function (relation1, relation2) {
                return relation1.order - relation2.order;
              });
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
