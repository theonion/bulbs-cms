'use strict';

angular.module('content.edit.controller', [
  'content.edit.linkBrowser',
  'content.edit.versionBrowser.api',
  'cms.firebase',
  'confirmationModal.factory'
])
  .controller('ContentEdit', function (
      $scope, $routeParams, $http, $window, $location, $timeout, $interval, $compile,
      $q, $modal, $, _, moment, keypress, Raven, PNotify, IfExistsElse, VersionStorageApi,
      ContentFactory, FirebaseApi, FirebaseArticleFactory, LinkBrowser, VersionBrowserModalOpener,
      PARTIALS_URL, MEDIA_ITEM_PARTIALS_URL, CMS_NAMESPACE, ConfirmationModal) {

    $scope.PARTIALS_URL = PARTIALS_URL;
    $scope.MEDIA_ITEM_PARTIALS_URL = MEDIA_ITEM_PARTIALS_URL;
    $scope.page = 'edit';
    $scope.saveArticleDeferred = $q.defer();

    // bind save keys
    var listener = new keypress.Listener();
    listener.simple_combo('cmd s', function (e) {
      $scope.saveArticle();
    });
    listener.simple_combo('ctrl s', function (e) {
      $scope.saveArticle();
    });

    var saveHTML =  '<i class=\'fa fa-floppy-o\'></i> Save';
    var navbarSave = '.navbar-save';

    // keep track of if article is dirty or not
    $scope.articleIsDirty = false;
    $scope.$watch('article', function () {
      $scope.articleIsDirty = !angular.equals($scope.article, $scope.last_saved_article);
    }, true);

    $scope.$watch('article.title', function () {
      $window.document.title = CMS_NAMESPACE + ' | Editing ' + ($scope.article && $('<span>' + $scope.article.title + '</span>').text());
    });

    var initEditPage = function () {
      setupUnsavedChangesGuard();
      getContent();
    };

    var setupUnsavedChangesGuard = function () {
      // browser navigation hook
      $window.onbeforeunload = function () {
        if ($scope.articleIsDirty) {
          return 'You have unsaved changes. Do you want to continue?';
        }
      };
      // angular navigation hook
      $scope.$on('$locationChangeStart', function (e, newUrl) {
        if ($scope.articleIsDirty && !$scope.ignoreGuard) {
          // keep track of if navigation has accepted by user
          $scope.ignoreGuard = false;

          // set up modal
          var modalScope = $scope.$new();
          modalScope.modalOnOk = function () {
            // user wants to navigate, ignore guard in this navigation action
            $location.url(newUrl.substring($location.absUrl().length - $location.url().length));
            $scope.ignoreGuard = true;

            // remove browser nav hook
            $window.onbeforeunload = function () {};
          };
          modalScope.modalTitle = 'Unsaved Changes!';
          modalScope.modalBody = 'You have unsaved changes. Do you want to continue?';
          modalScope.modalOkText = 'Yes';
          modalScope.modalCancelText = 'No';

          // open modal
          new ConfirmationModal(modalScope);

          // stop immediate navigation
          e.preventDefault();
        }
      });
    };

    var getArticleCallback = function (data) {
      $scope.article = data;

      $scope.last_saved_article = angular.copy(data);

      FirebaseApi.$connection
        .onConnect(function () {
          $scope.firebaseConnected = true;
        })
        .onDisconnect(function () {
          $scope.firebaseConnected = false;
        });

      // get article and active users, register current user as active
      FirebaseArticleFactory
        .$retrieveCurrentArticle()
          .then(function ($article) {

            var $activeUsers = $article.$activeUsers(),
                $versions = $article.$versions(),
                currentUser,
                savePNotify;

            $versions.$loaded(function () {
              $versions.$watch(function (e) {
                if (e.event === 'child_added') {

                  // order versions newest to oldest then grab the top one which should be the new version
                  var newVersion = _.sortBy($versions, function (version) {
                    return -version.timestamp;
                  })[0];

                  if (currentUser && newVersion.user.id !== currentUser.id) {

                    // close any existing save pnotify
                    if (savePNotify) {
                      savePNotify.remove();
                    }

                    var msg = '<b>' +
                                newVersion.user.displayName +
                              '</b> -- ' +
                              moment(newVersion.timestamp).format('MMM Do YYYY, h:mma') +
                              '<br>';
                    if ($scope.articleIsDirty) {
                      msg += ' You have unsaved changes that may conflict when you save.';
                    }
                    msg += ' Open the version browser to see their latest version.';

                    // this isn't the current user that saved, so someone else must have saved, notify this user
                    savePNotify = new PNotify({
                      title: 'Another User Saved!',
                      text: msg,
                      type: 'error',
                      mouse_reset: false,
                      hide: false,
                      confirm: {
                        confirm: true,
                        buttons: [{
                          text: 'Open Version Browser',
                          addClass: 'btn-primary',
                          click: function (notice) {
                            notice.mouse_reset = false;
                            notice.remove();
                            VersionBrowserModalOpener.open($scope, $scope.article);
                          }
                        }, {
                          addClass: 'hide'
                        }]
                      },
                      buttons: {
                        closer_hover: false,
                        sticker: false
                      }
                    });
                  }
                }
              });
            });

            // register a watch on active users so we can update the list in real time
            $activeUsers.$watch(function () {

              // unionize user data so that we don't have a bunch of the same users in the list
              $scope.activeUsers =
                _.chain($activeUsers)
                  // group users by their id
                  .groupBy(function (user) {
                    return user.id;
                  })
                  // take first user in grouping and use that data along with a count of the number of times they show
                  //  up in the list (number of sessions they have running)
                  .map(function (group) {
                    var groupedUser = group[0];
                    groupedUser.count = group.length;

                    if (currentUser && groupedUser.id === currentUser.id) {
                      groupedUser.displayName = 'You';
                    }

                    return groupedUser;
                  })
                  // sort users by their display names
                  .sortBy(function (user) {
                    return user.displayName === 'You' ? '' : user.displayName;
                  })
                  // now we have a list of unique users along with the number of sessions they have running, sorted by
                  //  their display names
                  .value();

            });

            // register current user active with this article
            $article.$registerCurrentUserActive()
              .then(function (user) {
                currentUser = user;
              });

            // who knows what kind of promises you might have in the future? so return the article object for chains
            return $article;

          });

    };

    var getContent = function () {
      return ContentFactory.one('content', $routeParams.id).get().then(getArticleCallback);
    };

    $scope.saveArticleIfDirty = function () {
      /*this is only for operations that trigger a saveArticle (e.g. send to editor)
      if the article isn't dirty, we don't want to fire saveArticle
      and possibly trigger the last-modified-guard or whatever else*/
      if ($scope.articleIsDirty) {
        return $scope.saveArticle();
      } else {
        //resolves immediately with article as the resolved value
        //(saveArticle resolves to article as well)
        return $q.when($scope.article);
      }
    };

    $scope.saveArticle = function () {
      $(navbarSave)
        .removeClass('btn-danger')
        .addClass('btn-success')
        .html('<i class=\'fa fa-refresh fa-spin\'></i> Saving');

      if ($scope.saveArticleDeferred.promise.$$state.status !== 0) {
        // there isn't a article already in the process of saving, use a new deferred
        $scope.saveArticleDeferred = $q.defer();
      }

      ContentFactory.one('content', $routeParams.id).get()
        .then(function (data) {
          if (data.last_modified &&
              $scope.article.last_modified &&
              moment(data.last_modified) > moment($scope.article.last_modified)) {

            $scope.saveArticleDeferred.reject();

            $modal.open({
              templateUrl: PARTIALS_URL + 'modals/last-modified-guard-modal.html',
              controller: 'LastmodifiedguardmodalCtrl',
              scope: $scope,
              resolve: {
                articleOnPage: function () { return $scope.article; },
                articleOnServer: function () { return data; }
              }
            });
          } else {
            $scope.postValidationSaveArticle();
          }
        })
        .catch(saveArticleErrorCbk);

      return $scope.saveArticleDeferred.promise;

    };

    var saveToContentApi = function () {
      $scope.article.put()
        .then(saveArticleSuccessCbk)
        .catch(saveArticleErrorCbk);
    };

    var saveArticleErrorCbk = function (data) {
      $(navbarSave)
        .removeClass('btn-success')
        .addClass('btn-danger')
        .html('<i class=\'fa fa-times\'></i> Error');
      if (status === 400) {
        $scope.errors = data;
      }
      $scope.saveArticleDeferred.reject();
    };

    /**
     * Last thing to happen on a successful save.
     */
    var saveArticleSuccessCbk = function (resp) {
      // store a version with version api
      VersionStorageApi.$create($scope.article, $scope.articleIsDirty);

      $(navbarSave).html('<i class=\'fa fa-check\'></i> Saved!');
      setTimeout(function () {
          $(navbarSave).html(saveHTML);
        }, 2500);
      $scope.article = resp;
      $scope.last_saved_article = angular.copy(resp);
      $scope.articleIsDirty = false;
      $scope.errors = null;
      $location.search('rating_type', null); //maybe just kill the whole query string with $location.url($location.path())
      $scope.saveArticleDeferred.resolve(resp);
    };

    $scope.postValidationSaveArticle = function () {
      if ($scope.article.status !== 'Published') {
        $scope.article.slug = $window.URLify($scope.article.title, 50);
      }
      saveToContentApi();
      return $scope.saveArticleDeferred.promise;
    };

    $scope.publishSuccessCbk = function () {
      return getContent();
    };

    $scope.trashSuccessCbk = function () {
      //delaying this so the user isn't sent back before the trashed content is removed from the listing view
      $timeout(function () {
        $window.history.back();
      }, 1500);
    };

    // finish initialization
    initEditPage();
  });
