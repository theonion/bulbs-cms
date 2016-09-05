'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal',
  'bulbs.cms.dateTimeModal',
  'OnionEditor',
  'Raven'
])
  .directive('liveBlogEntries', [
    'CmsConfig', 'LiveBlogApi', 'Raven', 'Utils',
    function (CmsConfig, LiveBlogApi, Raven, Utils) {
      return {
        link: function (scope) {
          var reportError = function (message, data) {
            Raven.captureMessage(message, data);
            scope.errorMessage = message;
          };

          var titleDisplay = function (entry) {
            return entry.headline ? '"' + entry.headline + '"' : 'an entry';
          };

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          scope.$watch('entries', function (newEntries, oldEntries) {
            if (!angular.equals(newEntries, oldEntries)) {
              scope.clearError();
            }
          }, true);

          LiveBlogApi.getEntries(scope.article.id)
            .then(function (response) {
              scope.entries = response.results;
            })
            .catch(function (response) {
              var message = 'An error occurred retrieving entries!';
              reportError(message, { response: response });
            });

          var entryForm = 'entryForm_';

          scope.wrapperForm = {};
          scope.makeEntryFormName = function (entry) {
            return entryForm + entry.id;
          };
          scope.getEntryForm = function (entry) {
            var name = scope.makeEntryFormName(entry);

            if (scope.wrapperForm[name]) {
              return scope.wrapperForm[name];
            }
            scope.wrapperForm[name] = {};
            return scope.wrapperForm[name];
          };

          var lock = Utils.buildLock();
          scope.transactionsLocked = lock.isLocked;

          scope.saveEntry = lock(function (entry) {

            return LiveBlogApi.updateEntry(entry)
              .catch(function (response) {
                var message = 'An error occurred attempting to save ' + titleDisplay(entry) + '!';
                reportError(message, { response: response });
              });
          });

          scope.deleteEntry = lock(function (entry) {

            return LiveBlogApi.deleteEntry(entry)
              .then(function () {
                var index = scope.entries.indexOf(entry);
                Utils.removeFrom(scope.entries, index);
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to delete ' + titleDisplay(entry) + '!';
                reportError(message, { response: response });
              });
          });
        },
        scope: {
          article: '='
        },
        templateUrl: CmsConfig.buildComponentPath(
          'live-blog',
          'live-blog-entries',
          'live-blog-entries.html'
        )
      };
    }
  ]);
