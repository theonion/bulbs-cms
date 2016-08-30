'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal',
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

          var lock = Utils.buildLock();
          scope.transactionsLocked = lock.isLocked;

          scope.deleteEntry = lock(function (entry) {

            return LiveBlogApi.deleteEntry(entry)
              .then(function () {
                var index = scope.entries.indexOf(entry);
                Utils.removeFrom(scope.entries, index);
              })
              .catch(function (response) {
                var titleDisplay = entry.headline ? '"' + entry.headline + '"' : 'an entry';
                var message = 'An error occurred attempting to delete ' + titleDisplay + '!';
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
