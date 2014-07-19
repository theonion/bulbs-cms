'use strict';

angular.module('bulbsCmsApp')
  .controller('ContenteditCtrl', function (
    $scope, $routeParams, $http, $window,
    $location, $timeout, $interval, $compile, $q, $modal,
    $, _, keypress, Raven,
    IfExistsElse, Localstoragebackup, ContentApi, ReviewApi, Login, routes)
  {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.CONTENT_PARTIALS_URL = routes.CONTENT_PARTIALS_URL;
    $scope.MEDIA_ITEM_PARTIALS_URL = routes.MEDIA_ITEM_PARTIALS_URL;
    $scope.CACHEBUSTER = routes.CACHEBUSTER;

    var getArticleCallback = function (data) {
      $window.article = $scope.article = data; //exposing article on window for debugging
      if ($location.search().rating_type && (!data.ratings || data.ratings.length === 0)) {
        $scope.article.ratings = [{
          type: $location.search().rating_type,
          media_item: {}
        }];
      }
      $scope.last_saved_article = angular.copy(data);

      $scope.$watch('article.image.id', function (newVal, oldVal) {
        if (!$scope.article) { return; }
        if (newVal && oldVal && newVal === oldVal) { return; }

        if (newVal === null || newVal === undefined) { return; } //no image

        if (!$scope.article.thumbnail || !$scope.article.thumbnail.id || //no thumbnail
          (newVal && oldVal && $scope.article.thumbnail && $scope.article.thumbnail.id && oldVal === $scope.article.thumbnail.id) || //thumbnail is same
          (!oldVal && newVal) //detail was trashed
        ) {
          $scope.article.thumbnail = {id: newVal, alt: null, caption: null};
        }


      });
    };

    function getContent() {
      return ContentApi.one('content', $routeParams.id).get().then(getArticleCallback);
    }
    getContent();

    $scope.$watch('article.title', function(){
      $window.document.title = routes.CMS_NAMESPACE + ' | Editing ' + ($scope.article && $('<span>' + $scope.article.title + '</span>').text());
    });

    $('body').removeClass();

    $scope.tagDisplayFn = function (o) {
      return o.name;
    };

    $scope.saveArticleDeferred = $q.defer();
    $scope.mediaItemCallbackCounter = undefined;
    $scope.$watch('mediaItemCallbackCounter', function () {
      if ($scope.mediaItemCallbackCounter === 0) {
        saveToContentApi();
      }
    });

    $scope.saveArticle = function () {
      Localstoragebackup.backupToLocalStorage();

      ContentApi.one('content', $routeParams.id).get().then(function (data) {
        if(data.last_modified &&
          $scope.article.last_modified &&
          moment(data.last_modified) > moment($scope.article.last_modified)){
          $scope.saveArticleDeferred.reject();
          $modal.open({
            templateUrl: routes.PARTIALS_URL + 'modals/last-modified-guard-modal.html',
            controller: 'LastmodifiedguardmodalCtrl',
            scope: $scope,
            resolve: {
              articleOnPage: function () { return $scope.article; },
              articleOnServer: function () { return data; },
            }
          });
        }else{
          $scope.postValidationSaveArticle();
        }
      });

      return $scope.saveArticleDeferred.promise;

    };

    var listener = new keypress.Listener();
    listener.simple_combo('cmd s', function(e) { $scope.saveArticle(); });
    listener.simple_combo('ctrl s', function(e) { $scope.saveArticle(); });

    $scope.postValidationSaveArticle = function () {

      var data = $scope.article;

      if ($scope.article.status !== 'Published') {
        $scope.article.slug = $window.URLify($scope.article.title, 50);
      }

      //because media_items get saved to a different API,
      //have to save all unsaved media_items first
      //then once thats done save the article.
      //should probably use PROMISES here but for now
      //using a good ol fashioned COUNTER
      $scope.mediaItemCallbackCounter = (data.ratings && data.ratings.length) || saveToContentApi();
      for (var i in data.ratings) {
        var show;

        if (data.ratings[i].type === 'tvseason') {
          var identifier = data.ratings[i].media_item.identifier;
          show = data.ratings[i].media_item.show;
          IfExistsElse.ifExistsElse(
            ReviewApi.all('tvseason').getList({
              season: identifier,
              show: show
            }),
            {identifier: identifier, show: show},
            mediaItemExistsCbkFactory(i),
            mediaItemDoesNotExistCbkFactory(i),
            saveArticleErrorCbk
          );
        } else if (data.ratings[i].type === 'tvepisode') {
          show = data.ratings[i].media_item.show;
          var season = data.ratings[i].media_item.season;
          var episode = data.ratings[i].media_item.episode;
          IfExistsElse.ifExistsElse(
            ReviewApi.all('tvepisode').getList({
              show: show,
              season: season,
              episode: episode
            }),
            {show: show, season: season, episode: episode},
            mediaItemExistsCbkFactory(i),
            mediaItemDoesNotExistCbkFactory(i),
            saveArticleErrorCbk
          );
        } else {
          saveMediaItem(i);
        }
      }
      return $scope.saveArticleDeferred.promise;

    }

    function mediaItemExistsCbkFactory(index) {
      return function (media_item) {
        $scope.article.ratings[index].media_item = media_item;
        $scope.mediaItemCallbackCounter -= 1;
      };
    }

    function mediaItemDoesNotExistCbkFactory(index) {
      return function () {
        saveMediaItem(index);
      };
    }

    var saveHTML =  "<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save";
    var navbarSave = ".navbar-save";

    function saveMediaItem(index) {
      var type = $scope.article.ratings[index].type;
      var mediaItem = $scope.article.ratings[index].media_item;
      mediaItem = ReviewApi.restangularizeElement(null, mediaItem, type);
      var q;
      if (mediaItem.id) {
        q = mediaItem.put();
      } else {
        q = mediaItem.post();
      }
      q.then(function (resp) {
        $scope.article.ratings[index].media_item = resp;
        $scope.mediaItemCallbackCounter -= 1;
      }).catch(saveArticleErrorCbk);
    }

    function saveToContentApi() {
      $(navbarSave).html('<i class=\'glyphicon glyphicon-refresh fa-spin\'></i> Saving');
      $scope.article.put()
        .then(saveArticleSuccessCbk, saveArticleErrorCbk);
    }

    function saveArticleErrorCbk(data) {
      console.log(data)
      $(navbarSave).html('<i class=\'glyphicon glyphicon-remove\'></i> Error');
      if (status === 400) {
        $scope.errors = data;
      }
      $scope.saveArticleDeferred.reject();
    }

    function saveArticleSuccessCbk(resp) {
      $(navbarSave).html('<i class=\'glyphicon glyphicon-ok\'></i> Saved!');
      setTimeout(function () {
          $(navbarSave).html(saveHTML);
        }, 2500);
      $window.article = $scope.article = resp;
      $scope.last_saved_article = angular.copy(resp);
      $scope.errors = null;
      $location.search('rating_type', null); //maybe just kill the whole query string with $location.url($location.path())
      $scope.saveArticleDeferred.resolve(resp);
    }

    $scope.$watch('article', function(){
      if(angular.equals($scope.article, $scope.last_saved_article)){
        $scope.articleIsDirty = false;
      }else{
        $scope.articleIsDirty = true;
      }
    }, true);

    $scope.$watch('articleIsDirty', function(){
      if($scope.articleIsDirty){
        $window.onbeforeunload = function () {
          return 'You have unsaved changes. Do you want to continue?';
        };
      }else{
        $window.onbeforeunload = function () {};
      }
    });

    $scope.addRating = function (type) {
      $scope.article.ratings.push({
        grade: '',
        type: type,
        media_item: {
          'type': type
        }
      });
      $('#add-review-modal').modal('hide');
    };

    $scope.deleteRating = function (index) {
      $scope.article.ratings.splice(index, 1);
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

    var backupInterval = (function(){
      var interval = 60000; //1 minute
      return $interval(Localstoragebackup.backupToLocalStorage, interval)
    })();

  });
