'use strict';

angular.module('bulbs.cms.liveBlog.entries', [
  'OnionEditor',
  'Raven',
  'bulbs.cms.currentUser',
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.dateTimeModal',
  'bulbs.cms.liveBlog.api',
  'bulbs.cms.liveBlog.entries.authorBridge',
  'bulbs.cms.recircChooser',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'confirmationModal',
  'firebase',
  'jquery',
  'lodash'
])
  .directive('liveBlogEntries', [
    '_', '$',  '$firebaseObject', '$q', 'CmsConfig', 'CurrentUserApi', 'FirebaseApi',
      'LiveBlogApi', 'Raven', 'Utils',
    function (_, $, $firebaseObject, $q, CmsConfig, CurrentUserApi, FirebaseApi,
        LiveBlogApi, Raven, Utils) {

      return {
        link: function (scope, element) {

          var reportError = function (message, data) {
            Raven.captureMessage(message, data);
            scope.errorMessage = message;
          };

          var titleDisplay = function (entry) {
            return entry.headline ? '"' + entry.headline + '"' : 'an entry';
          };

          var sortEntries = function () {
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
          };

          var refreshEntriesList = function () {
            LiveBlogApi.getEntries(scope.article.id)
              .then(function (response) {

                if (scope.entries) {
                  // local entries vs. sever entries diff-ing
                  var unhandledEntriesFromServer = response.results;
                  var localEntryIdsToDelete = [];

                  scope.entries.forEach(function (entry, i) {
                    var entryForm = scope.getEntryForm(entry);
                    var entryFromServerIndex = _.findIndex(
                      unhandledEntriesFromServer,
                      'id',
                      entry.id
                    );

                    if (entryFromServerIndex > -1) {
                      var entryFromServer = unhandledEntriesFromServer
                        .splice(entryFromServerIndex, 1)[0];
                      var equivalentData = _.matches(entry)(entryFromServer);

                      if (!equivalentData) {
                        if (entryForm.$dirty) {
                          // this entry has local changes and there's new data on
                          //  the server, mark this as dangerous to save
                          entryForm.$dirtyAndWillOverwrite = true;
                        } else {
                          // this entry doesn't have local changes and there's new
                          //  data on the server, just replace with the new data
                          scope.entries[i] = entryFromServer;
                        }
                      }
                    } else if (entry.id) {
                      if (entryForm.$dirty) {
                        // deleted on the server and user has local changes
// TODO : need a new strat here since we're tracking by id, there's currently no
//  way to handle an entry with no id
                        // delete entry.id;
                        // entryForm.$setDirty();
                      } else {
                        // deleted and no local changes, just remove from the list
                        localEntryIdsToDelete.push(entry.id);
                      }
                    }
                  });

                  // add remaining server entries to local list, these are new
                  unhandledEntriesFromServer.forEach(function (entryFromServer) {
                    // this is a new entry from the server
                    scope.entries.push(entryFromServer);
                  });

                  // remove entries deleted on the server
                  localEntryIdsToDelete.forEach(function (idToDelete) {
                    var iToDelete = _.findIndex(scope.entries, function (entry) {
                      return entry.id = idToDelete;
                    });
                    scope.entries.splice(iToDelete, 1);
                  });
                } else {
                  scope.entries = response.results;
                }

                sortEntries();

                scope.numberOfDifferentEntries = 0;
              })
              .catch(function (response) {
                var message = 'An error occurred retrieving entries!';
                reportError(message, { response: response });
              });
          };

          scope.numberOfDifferentEntries = 0;
          FirebaseApi.$authorizePublic()
            .then(function (rootPublicRef) {

              var firebaseEntries = $firebaseObject(rootPublicRef.child(
                Utils.path.join(
                  'articles',
                  scope.article.id,
                  'entries'
                )
              ));

              firebaseEntries.$watch(function () {

                if (scope.entries) {
                  var firebaseIds = Object.keys(firebaseEntries)
                    .filter(function (key) {
                      return !key.startsWith('$');
                    })
                    .map(function (key) {
                      return parseInt(key, 10);
                    });
                  var localIds = _.map(scope.entries, 'id');

                  scope.numberOfDifferentEntries = _.xor(localIds, firebaseIds).length;
                }
              });
            });

          var recirc = scope.article.recirc_query;
          if (angular.isUndefined(recirc.included_ids)) {
            recirc.included_ids = [];
          }

          scope.clearError = function () {
            scope.errorMessage = '';
          };

          scope.$watch('entries', function (newEntries, oldEntries) {
            if (!angular.equals(newEntries, oldEntries)) {
              scope.clearError();
            }
          }, true);

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
          scope.isEntryFormSaveDisabled = function (entry) {
            return scope.transactionsLocked() || scope.getEntryForm(entry).$pristine;
          };

          var lock = Utils.buildLock();
          scope.transactionsLocked = lock.isLocked;

          scope.addEntry = lock(function () {

            return CurrentUserApi.getCurrentUserWithCache()
              .then(function (user) {
                var now = moment();

                return LiveBlogApi.createEntry({
                  liveblog: scope.article.id,
                  created_by: user,
                  created: now,
                  updated_by: user,
                  updated: now,
                  recirc_content: []
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
            return CurrentUserApi.getCurrentUserWithCache()
              .then(function (user) {
                var oldUpdateBy = entry.updated_by;
                var oldUpdated = entry.updated;

                entry.updated_by = user;
                entry.updated = moment();

                return LiveBlogApi.updateEntry(entry)
                  .then(function () {
                    var entryForm = scope.getEntryForm(entry);

                    entryForm.$dirtyAndWillOverwrite = false;
                    entryForm.$setPristine();
                  })
                  .catch(function (response) {
                    entry.updated_by = oldUpdateBy;
                    entry.updated = oldUpdated;

                    var message = 'An error occurred attempting to save ' + titleDisplay(entry) + '!';
                    reportError(message, { response: response });

                    return $q.reject();
                  });
              });
          });

          scope.reloadEntries = lock(function (entry) {

            return refreshEntriesList();
          });

          scope.publishAndSave = function (entry, newDate) {
            var oldDate = entry.published;

            entry.published = newDate;

            return scope.saveEntry(entry)
              .then(sortEntries)
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

          scope.jumpToTop = function () {
            $(document)
              .scrollTop(element.find('.live-blog-entries-header').offset().top - 50);
          };

          var stickyClass = 'live-blog-entries-jump-to-top-fixed';
          $(document).on('scroll', function () {
            var offsetTop = element.find('.live-blog-entries-header').offset().top;
            var windowTop = $(window).scrollTop();
            var inThreshold =  windowTop - offsetTop > 500;
            var jumpButton = element.find('.live-blog-entries-jump-to-top');
            var alreadyHasClass = jumpButton.hasClass(stickyClass);

            if (inThreshold && !alreadyHasClass) {
              jumpButton.addClass(stickyClass);
            } else if (!inThreshold && alreadyHasClass) {
              jumpButton.removeClass(stickyClass);
            }
          });

          // directive initialization
          refreshEntriesList();
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
