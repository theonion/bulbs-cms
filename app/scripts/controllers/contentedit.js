'use strict';

angular.module('bulbsCmsApp')
  .controller('ContenteditCtrl', function (
    $scope, $routeParams, $http, $window,
    $location, $timeout, $interval, $compile, $q, $modal,
    $, _, CmsConfig, moment, keypress, Raven, PNotify,
    IfExistsElse, VersionStorageApi, ContentFactory, FirebaseApi,
    FirebaseArticleFactory, Login, VersionBrowserModalOpener)
  {
    var listener = new keypress.Listener();
    listener.simple_combo('cmd s', function (e) { $scope.saveArticle(); });
    listener.simple_combo('ctrl s', function (e) { $scope.saveArticle(); });

    var saveHTML =  '<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save';
    var navbarSave = '.navbar-save';

    var getArticleCallback = function (data) {
      $window.article = $scope.article = data; //exposing article on window for debugging

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
      return ContentFactory.one('content', $routeParams.id)
          .get()
          .then(getArticleCallback);
    };

    var saveArticleErrorCbk = function (data) {
      $(navbarSave)
        .removeClass('btn-success')
        .addClass('btn-danger')
        .html('<i class=\'glyphicon glyphicon-remove\'></i> Error');
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

      $(navbarSave).html('<i class=\'glyphicon glyphicon-ok\'></i> Saved!');
      setTimeout(function () {
          $(navbarSave).html(saveHTML);
        }, 2500);
      $window.article = $scope.article = resp;
      $scope.last_saved_article = angular.copy(resp);
      $scope.articleIsDirty = false;
      $scope.articleIsNew = false;
      $scope.errors = null;

      if ($routeParams.id === 'new') {
        $location.path('/cms/app/edit/' + $scope.article.id + '/' + $routeParams.contentType);
      }

      $location.search('rating_type', null); //maybe just kill the whole query string with $location.url($location.path())
      $scope.saveArticleDeferred.resolve(resp);
    };

    $scope.PARTIALS_URL = '/views/';
    $scope.buildContentPartialsPath = CmsConfig.buildContentPartialsPath;
    $scope.page = 'edit';
    $scope.contentEditGlobals = {
      canSave: true
    };

    $scope.$watch('article.title', function () {
      $window.document.title = CmsConfig.getCmsName() + ' | Editing ' + ($scope.article && $('<span>' + $scope.article.title + '</span>').text());
    });

    $scope.saveArticleDeferred = $q.defer();

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
      if ($scope.contentEditGlobals.saveError) {
        return $scope.saveArticleDeferred.reject();
      }

      $(navbarSave)
        .removeClass('btn-danger')
        .addClass('btn-success')
        .html('<i class=\'glyphicon glyphicon-refresh fa-spin\'></i> Saving');

      if ($routeParams.id === 'new') {
        $scope.postValidationSaveArticle();
      } else {
        ContentFactory.one('content', $routeParams.id).get()
          .then(function (data) {
            if (data.last_modified &&
              $scope.article.last_modified &&
              moment(data.last_modified) > moment($scope.article.last_modified)) {
              $scope.saveArticleDeferred.reject();
              $modal.open({
                templateUrl: '/views/modals/last-modified-guard-modal.html',
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
      }

      return $scope.saveArticleDeferred.promise;
    };

    $scope.postValidationSaveArticle = function () {
      if ($scope.article.status !== 'Published') {
        $scope.article.slug = $window.URLify($scope.article.title, 50);
      }

      var params = {};
      if ($routeParams.id === 'new') {
        params['doctype'] = $scope.article.polymorphic_ctype;
      }

      $scope.article.save(params)
        .then(saveArticleSuccessCbk)
        .catch(saveArticleErrorCbk);

      return $scope.saveArticleDeferred.promise;
    };

    // keep track of if article is dirty or not
    $scope.articleIsDirty = $routeParams.id === 'new';
    $scope.$watch(function () {
      return !angular.equals($scope.article, $scope.last_saved_article);
    }, function (isDirty) {
      $scope.articleIsDirty = isDirty;
    });

    $scope.$watch('articleIsDirty', function () {
      if ($scope.articleIsDirty) {
        $window.onbeforeunload = function () {
          return 'You have unsaved changes. Do you want to continue?';
        };
      } else {
        $window.onbeforeunload = function () {};
      }
    });

    $scope.publishSuccessCbk = function () {
      return getContent();
    };

    $scope.trashSuccessCbk = function () {
      //delaying this so the user isn't sent back before the trashed content is removed from the listing view
      $timeout(function () {
        $window.history.back();
      }, 1500);
    };

    var initialize = function () {
      if ($routeParams.id === 'new') {
        $scope.articleIsNew = true;
        $scope.article = ContentFactory.oneUrl('content');
        $scope.article['polymorphic_ctype'] = $routeParams.contentType;
      } else {
        getContent();
      }
    };

    initialize();
  });
