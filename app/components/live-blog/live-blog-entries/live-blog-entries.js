'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'bulbs.cms.currentUser.api',
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.liveBlog.entries.authorBridge',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal',
  'OnionEditor',
  'Raven'
])
  .directive('liveBlogEntries', [
    '$q', 'CmsConfig', 'CurrentUserApi', 'LiveBlogApi', 'Raven', 'Utils',
    function ($q, CmsConfig, CurrentUserApi, LiveBlogApi, Raven, Utils) {
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

          var panelOpen = {};
          scope.isPanelOpen = function (entry) {
            if (angular.isUndefined(panelOpen[entry.id])) {
              panelOpen[entry.id] = true;
            }
            return panelOpen[entry.id];
          };
          scope.togglePanel = function (entry) {
            panelOpen[entry.id] = !panelOpen[entry.id];
          };
          scope.collapseAll = function () {
            scope.entries.forEach(function (entry) {
              panelOpen[entry.id] = false;
            });
          };
          scope.expandAll = function () {
            scope.entries.forEach(function (entry) {
              panelOpen[entry.id] = true;
            });
          };

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

          scope.addEntry = lock(function () {

            return CurrentUserApi.getCurrentUserWithCache()
              .then(function (user) {

                return LiveBlogApi.createEntry({
                  liveblog: scope.article.id,
                  createdBy: user,
                  created: moment().format()
                })
                  .then(function (entry) {
                    scope.entries.unshift(entry);
                  })
                  .catch(function (response) {
                    var message = 'An error occurred attempting to add an entry!';
                    reportError(message, { response: response });
                  });
              });
          });

          scope.saveEntry = lock(function (entry) {

            return LiveBlogApi.updateEntry(entry)
              .then(function () {
                scope.getEntryForm(entry).$setPristine();
              })
              .catch(function (response) {
                var message = 'An error occurred attempting to save ' + titleDisplay(entry) + '!';
                reportError(message, { response: response });
                return $q.reject();
              });
          });

          scope.publishAndSave = function (entry, newDate) {
            var oldDate = entry.published;

            entry.published = newDate;

            return scope.saveEntry(entry)
              .then(function () {
                // sort entries from falsy to newest publish date to oldest publish date
                scope.entries.sort(function (entry1, entry2) {
                  var entry1IsMoment = moment.isMoment(entry1.published);
                  var entry2IsMoment = moment.isMoment(entry2.published);

                  if (entry1IsMoment &&
                      (!entry2IsMoment || entry1.published.isBefore(entry2.published))) {
                    return 1;
                  } else if (entry2IsMoment &&
                      (!entry1IsMoment || entry2.published.isBefore(entry1.published))) {
                    return -1;
                  }

                  return 0;
                });
              })
              .catch(function () {
                entry.published = oldDate;
                return false;
              });
          };

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
        restrict: 'E',
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
