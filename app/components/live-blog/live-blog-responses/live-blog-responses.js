'use strict';

angular.module('bulbs.cms.liveBlog.responses', [
  'OnionEditor',
  'bulbs.cms.currentUser',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.site.config',
  'bulbs.cms.user.nameDisplayFilter',
  'bulbs.cms.utils',
  'confirmationModal',
  'lodash'
])
  .directive('liveBlogResponses', [
    '_', '$q', 'CmsConfig', 'CurrentUserApi', 'LiveBlogApi', 'Raven', 'Utils',
    function (_, $q, CmsConfig, CurrentUserApi, LiveBlogApi, Raven, Utils) {

      return {
        link: function (scope, element) {

          var reportError = function (message, data) {
            Raven.captureMessage(message, data);
            scope.errorMessage = message;
          };

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          LiveBlogApi.getEntryResponses(scope.entry.id)
            .then(function (response) {
              scope.entryResponses = response.results;
            })
            .catch(function (response) {
              var message = 'An error occurred retrieving responses for entry with id ' + scope.entry.id + '!';
              reportError(message, { response: response });
            });

          var panelOpen = {};
          scope.isPanelOpen = function (entryResponse) {
            if (angular.isUndefined(panelOpen[entryResponse.id])) {
              panelOpen[entryResponse.id] = true;
            }
            return panelOpen[entryResponse.id];
          };
          scope.togglePanel = function (entryResponse) {
            panelOpen[entryResponse.id] = !panelOpen[entryResponse.id];
          };
          scope.collapseAll = function () {
            scope.entryResponses.forEach(function (entryResponse) {
              panelOpen[entryResponse.id] = false;
            });
          };
          scope.expandAll = function () {
            scope.entryResponses.forEach(function (entryResponse) {
              panelOpen[entryResponse.id] = true;
            });
          };

          var responseForm = 'responseForm_';

          scope.wrapperForm = {};
          scope.makeEntryResponseFormName = function (entryResponse) {
            return responseForm + entryResponse.id;
          };
          scope.getEntryResponseForm = function (entryResponse) {
            var name = scope.makeEntryResponseFormName(entryResponse);

            if (scope.wrapperForm[name]) {
              return scope.wrapperForm[name];
            }
            scope.wrapperForm[name] = {};
            return scope.wrapperForm[name];
          };
          scope.isEntryResponseFormSaveDisabled = function (entryResponse) {
            return scope.transactionsLocked() || scope.getEntryResponseForm(entryResponse).$pristine;
          };

          var lock = Utils.buildLock();
          scope.transactionsLocked = lock.isLocked;

          scope.addEntryResponse = lock(function (entry, newData) {

            return CurrentUserApi.getCurrentUserWithCache()
              .then(function (user) {
                var now = moment();

                var newDataPayload = _.assign({
                  entry: entry.id,
                  createdBy: user,
                  created: now,
                  updatedBy: user,
                  updated: now
                }, newData);

                return LiveBlogApi.createEntryResponse(entry, newDataPayload)
                  .then(function (entryResponse) {
                    scope.entryResponses.push(entryResponse);
                  })
                  .catch(function (response) {
                    var message = 'An error occurred attempting to add a response for entry with id ' + scope.entry.id + '!';
                    reportError(message, { response: response });
                  });
              });
          });

          scope.copyEntryResponse = function (entry, entryResponseToCopy) {
            var newData = _.omit(entryResponseToCopy, 'id');

            newData.internalName = entryResponseToCopy.internalName || '' + '(copy)';
            newData.published = false;

            return scope.addEntryResponse(entry, newData);
          };

          scope.saveEntryResponse = lock(function (entryResponse) {

            return CurrentUserApi.getCurrentUserWithCache()
              .then(function (user) {
                var oldUpdateBy = entryResponse.updatedBy;
                var oldUpdated = entryResponse.updated;

                entryResponse.updatedBy = user;
                entryResponse.updated = moment();

                return LiveBlogApi.updateEntryResponse(entryResponse)
                  .then(function () {
                    scope.getEntryResponseForm(entryResponse).$setPristine();
                  })
                  .catch(function (response) {
                    entryResponse.updatedBy = oldUpdateBy;
                    entryResponse.updated = oldUpdated;

                    var message = 'An error occurred attempting to save response with id ' + entryResponse.id + ' for entry with id ' + scope.entry.id + '!';
                    reportError(message, { response: response });

                    return $q.reject();
                  });
              });
          });

          scope.publishAndSaveEntryResponse = function (entryResponse) {
            var wasPublished = !!entryResponse.published;

            entryResponse.published = !wasPublished;

            return scope.saveEntryResponse(entryResponse)
              .catch(function () {
                entryResponse.published = wasPublished;
                return false;
              });
          };

          scope.deleteEntryResponse = lock(function (entryResponse) {

            return LiveBlogApi.deleteEntryResponse(entryResponse)
              .then(function () {
                var index = scope.entryResponses.indexOf(entryResponse);
                Utils.removeFrom(scope.entryResponses, index);
              })
              .catch(function (response) {
                var message = 'An error ocurred attempting to delete response with id ' + entryResponse.id + ' for entry with id ' + scope.entry.id + '!';
                reportError(message, { response: response });
              });
          });
        },
        restrict: 'E',
        scope: {
          entry: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-responses',
          'live-blog-responses.html'
        )
      };
    }
  ]);

