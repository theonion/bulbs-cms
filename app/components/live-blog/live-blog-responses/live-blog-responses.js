'use strict';

angular.module('bulbs.cms.liveBlog.responses', [
  'OnionEditor',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal'
])
  .directive('liveBlogResponses', [
    'CmsConfig', 'LiveBlogApi', 'Raven', 'Utils',
    function (CmsConfig, LiveBlogApi, Raven, Utils) {

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
              scope.responses = response.results;
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
            scope.entry.responses.forEach(function (entryResponse) {
              panelOpen[entryResponse.id] = false;
            });
          };
          scope.expandAll = function () {
            scope.entry.responses.forEach(function (entryResponse) {
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

          scope.addEntryResponse = lock(function () {

            return LiveBlogApi.createEntryResponse(entry, {
              entry: scope.entry.id,
              published: false
            })
              .then(function (entryResponse) {
                scope.responses.unshift(entryResponse);
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to add a response for entry with id ' + scope.entry.id + '!';
                reportError(message, { response: response });
              });
          });

          scope.saveEntryResponse = lock(function (entryResponse) {

            return LiveBlogApi.updateEntryResponse(entry, entryResponse)
              .then(function () {
                scope.getEntryResponseForm(entryResponse).$setPristine();
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to save response with id ' + entryResponse.id + ' for entry with id ' + scope.entry.id + '!';
                reportError(message, { response: response });

                return $q.reject();
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

