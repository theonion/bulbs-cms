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

            $scope.addRelation = function (title) {
              if (!$scope.addRelationDisabled) {
                $scope.addRelationDisabled = true;

                SuperFeaturesApi.createSuperFeature({
                  parent: $scope.article.id,
                  superfeature_type: $scope.article.default_child_type,
                  title: title
                })
                  .then(function (relation) {
                    $scope.relations.push(relation);
                    $scope.redoOrdering();
                  })
                  .catch(function (response) {
                    var message = 'An error occurred attempting to add a child page!';
                    $scope.reportError(message, { response: response });
                  })
                  .finally(function () {
                    $scope.addRelationDisabled = false;
                  });
              }
            };

            $scope.ongoingRelationTransactions = {};

            $scope.isAtLeastOneOngoingRelationTransaction = function () {
              return Object.keys($scope.ongoingRelationTransactions)
                .reduce(function (ongoing, relationId) {
                  return ongoing || $scope.ongoingRelationTransactions[relationId];
                }, false);
            };

            $scope.updateRelationsPublishDates = function () {

              if (!$scope.isAtLeastOneOngoingRelationTransaction() &&
                  !$scope.runningRelationPublishDateUpdate) {

                $scope.runningRelationPublishDateUpdate = true;

                SuperFeaturesApi
                  .updateAllRelationPublishDates($scope.article.id)
                  .catch(function (response) {
                    var message = 'An error occurred attempting to update child publish dates!';
                    $scope.reportError(message, { response: response });
                  })
                  .finally(function () {
                    $scope.runningRelationPublishDateUpdate = false;
                  });
              }
            };

            $scope.saveRelation = function (relation) {

              if (!$scope.ongoingRelationTransactions[relation.id] &&
                  !$scope.runningRelationPublishDateUpdate) {

                $scope.ongoingRelationTransactions[relation.id] = true;

                var relationCopy = angular.copy(relation);
                relationCopy.order = relation.order - 1;

                SuperFeaturesApi.updateSuperFeature(relationCopy)
                  .catch(function (response) {
                    var titleDisplay = relation.title ? '"' + relation.title + '"' : 'a relation';
                    var message = 'An error occurred attempting to update ' + titleDisplay + '!';
                    $scope.reportError(message, { response: response });
                  })
                  .finally(function () {
                    $scope.ongoingRelationTransactions[relation.id] = false;
                    $scope.getRelationForm(relation).$setPristine();
                  });
              }
            };

            $scope.deleteRelation = function (relation) {

              if (!$scope.ongoingRelationTransactions[relation.id] &&
                  !$scope.runningRelationPublishDateUpdate) {

                $scope.ongoingRelationTransactions[relation.id] = true;

                SuperFeaturesApi.deleteSuperFeature(relation)
                  .then(function () {
                    $scope.removeItem($scope.relations.indexOf(relation));
                  })
                  .catch(function (response) {
                    var titleDisplay = relation.title ? '"' + relation.title + '"' : 'a relation';
                    var message = 'An error occurred attempting to delete ' + titleDisplay + '!';
                    $scope.reportError(message, { response: response });
                  })
                  .finally(function () {
                    $scope.ongoingRelationTransactions[relation.id] = false;
                  });
              }
            };
          }
        ],
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {
          scope.reportError = function (message, data) {
            Raven.captureMessage(message, data);
            scope.errorMessage = message;
          };

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          scope.$watch('relations', function (newRelations, oldRelations) {
            if (!angular.equals(newRelations, oldRelations)) {
              scope.clearError();
            }
          }, true);

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
            })
            .catch(function (response) {
              var message = 'An error occurred retrieving relations!';
              scope.reportError(message, { response: response });
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
