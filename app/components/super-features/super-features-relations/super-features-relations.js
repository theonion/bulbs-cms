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
  'lodash',
  'moment',
  'Raven',
  'statusFilter.config'
])
  .directive('superFeaturesRelations', [
    '_', '$q', 'CmsConfig', 'moment', 'Raven', 'SuperFeaturesApi',
      'StatusFilterOptions', 'Utils',
    function (_, $q, CmsConfig, moment, Raven, SuperFeaturesApi,
        StatusFilterOptions, Utils) {

      return {
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

          var normalizeOrderings = function (relations) {
            relations.forEach(function (relation, i) {
              relation.ordering = i + 1;
            });
          };

          SuperFeaturesApi.getSuperFeatureRelations(scope.article.id)
            .then(function (response) {
              scope.relations = response.results;
              normalizeOrderings(scope.relations);
            })
            .catch(function (response) {
              var message = 'An error occurred retrieving relations!';
              scope.reportError(message, { response: response });
            });

          scope.statuses = StatusFilterOptions.getStatuses()
            .filter(function (status) {
              // remove default status
              return !!status.value;
            });

          var relationFormPrefix = 'relationForm_';
          var orderingFormPrefix = 'orderingInputForm_';

          scope.wrapperForm = {};
          scope.makeRelationFormName = function (relation) {
            return relationFormPrefix + relation.id;
          };
          scope.makeOrderingFormName = function (relation) {
            return orderingFormPrefix + relation.id;
          };
          scope.getRelationForm = function (relation) {
            return scope.wrapperForm[scope.makeRelationFormName(relation)];
          };
          scope.getOrderingForm = function (relation) {
            return scope.wrapperForm[scope.makeOrderingFormName(relation)];
          };

          scope.isAtLeastOneRelationFormDirty = function () {
            return Object.keys(scope.wrapperForm)
              .reduce(function (isDirty, key) {
                if (key.startsWith(relationFormPrefix)) {
                  return isDirty || scope.wrapperForm[key].$dirty;
                }
                return isDirty;
              }, false);
          };

          var transactionLock = false;
          scope.transactionsLocked = function () {
            return transactionLock;
          };
          var transaction = function (promised) {

            return function () {
              if (!transactionLock) {
                transactionLock = true;

                return promised.apply(null, arguments).finally(function () {
                  transactionLock = false;
                });
              }

              return $q.reject();
            };
          };

          scope.moveRelation = transaction(function (fromIndex, toIndex) {

            // do transformation on a copy first, save that then after successful
            //  request, apply transformation to actual list
            var payload = scope.relations.map(function (relation) {
              return _.pick(relation, 'id', 'ordering');
            });

            Utils.moveTo(payload, fromIndex, toIndex, true);
            normalizeOrderings(payload);

            return SuperFeaturesApi.updateSuperFeatureRelationsOrdering(
              scope.article.id,
              payload
            )
              .then(function () {
                Utils.moveTo(scope.relations, fromIndex, toIndex, true);
                normalizeOrderings(scope.relations);
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to reorder a child!';
                scope.reportError(message, { response: response });
              });
          });

          scope.addRelation = transaction(function (title) {

            return SuperFeaturesApi.createSuperFeature({
              parent: scope.article.id,
              superfeature_type: scope.article.default_child_type,
              title: title,
              ordering: (_.max(scope.relations, 'ordering').ordering || 0) + 1
            })
              .then(function (relation) {
                scope.relations.push(relation);
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to add a child page!';
                scope.reportError(message, { response: response });
              });
          });

          scope.updateRelationsPublishDates = transaction(function () {

            return SuperFeaturesApi
              .updateAllRelationPublishDates(scope.article.id)
              .then(function (response) {
                scope.relations.forEach(function (relation) {
                  relation.published = moment.tz(
                    scope.article.published,
                    CmsConfig.getTimezoneName()
                  );
                });
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to update child publish dates!';
                scope.reportError(message, { response: response });
              });
          });

          scope.saveRelation = transaction(function (relation) {

            var relationCopy = angular.copy(relation);
            relationCopy.parent = scope.article.id;

            return SuperFeaturesApi.updateSuperFeature(relationCopy)
              .catch(function (response) {
                var titleDisplay = relation.title ? '"' + relation.title + '"' : 'a relation';
                var message = 'An error occurred attempting to update ' + titleDisplay + '!';
                scope.reportError(message, { response: response });
              })
              .finally(function () {
                scope.getRelationForm(relation).$setPristine();
              });
          });

          scope.deleteRelation = transaction(function (relation) {

            return SuperFeaturesApi.deleteSuperFeature(relation)
              .then(function () {
                var index = scope.relations.indexOf(relation);
                Utils.removeFrom(scope.relations, index);
                normalizeOrderings(scope.relations);
              })
              .catch(function (response) {
                var titleDisplay = relation.title ? '"' + relation.title + '"' : 'a relation';
                var message = 'An error occurred attempting to delete ' + titleDisplay + '!';
                scope.reportError(message, { response: response });
              });
          });
        },
        templateUrl: CmsConfig.buildComponentPath(
          'super-features',
          'super-features-relations',
          'super-features-relations.html'
        )
      };
    }
  ]);
