'use strict';

angular.module('bulbsCmsApp')
  .controller('ContenteditCtrl', function (
    $scope, $routeParams, $http, $window,
    $location, $timeout, $interval, $compile, $q, $modal,
    $, _, keypress,
    IfExistsElse, Localstoragebackup, ContentApi, ReviewApi, Login,
    routes)
  {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.CONTENT_PARTIALS_URL = routes.CONTENT_PARTIALS_URL;
    $scope.MEDIA_ITEM_PARTIALS_URL = routes.MEDIA_ITEM_PARTIALS_URL;
    $scope.CACHEBUSTER = routes.CACHEBUSTER;

    var getArticleCallback = function (data) {
      $window.article = $scope.article = _.clone(data);
      $scope.last_saved_article = _.clone(data);
      if ($location.search().rating_type && (!data.ratings || data.ratings.length === 0)) {
        $scope.article.ratings = [{
          type: $location.search().rating_type
        }];
      }

      $scope.$watch('article.detail_image.id', function (newVal, oldVal) {
        if (!$scope.article) { return; }
        if (newVal && oldVal && newVal === oldVal) { return; }

        if (newVal === null) { return; } //no image

        if (!$scope.article.image || !$scope.article.image.id || //no thumbnail
          (newVal && oldVal && $scope.article.image && $scope.article.image.id && oldVal === $scope.article.image.id) || //thumbnail is same
          (!oldVal && newVal) //detail was trashed
        ) {
          $scope.article.image = {id: newVal, alt: null, caption: null};
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

    $scope.tagCallback = function (o, input, freeForm) {
      var tagVal = freeForm ? o : o.name;
      IfExistsElse.ifExistsElse(
        ContentApi.all('tag').getList({
          ordering: 'name',
          search: tagVal
        }),
        {name: tagVal},
        function (tag) { $scope.article.tags.push(tag); },
        function (value) { $scope.article.tags.push({name: value.name, type: 'content_tag', new: true}); },
        function (data, status) { if (status === 403) { Login.showLoginModal(); } }
      );
      $(input).val('');
    };

    $scope.sectionCallback = function (o, input, freeForm) {
      var tagVal = freeForm ? o : o.name;
      IfExistsElse.ifExistsElse(
        ContentApi.all('tag').getList({
          ordering: 'name',
          search: tagVal
        }),
        {name: tagVal},
        function (tag) { $scope.article.tags.push(tag); },
        function () { console.log('Can\'t create sections.'); },
        function (data, status) { if (status === 403) { Login.showLoginModal(); } }
      );
      $(input).val('');
    };

    $scope.removeTag = function (e) {
      var tag = $(e.target).parents('[data-tag]').data('tag');
      var id = tag.id;
      var newtags = [];
      for (var i in $scope.article.tags) {
        if ($scope.article.tags[i].id !== id) {
          newtags.push($scope.article.tags[i]);
        }
      }
      $scope.article.tags = newtags;
    };

    $scope.removeAuthor = function (e) {
      var author = $(e.target).parents('[data-author]').data('author');
      var id = author.id;
      var newauthors = [];
      for (var i in $scope.article.authors) {
        if ($scope.article.authors[i].id !== id) {
          newauthors.push($scope.article.authors[i]);
        }
      }
      $scope.article.authors = newauthors;
    };

    $scope.featureTypeDisplayFn = function (o) {
      return o.name;
    };

    $scope.featureTypeCallback = function (o, input, freeForm) {
      var fVal = freeForm ? o : o.name;
      IfExistsElse.ifExistsElse(
        ContentApi.all('things').getList({
          type: 'feature_type',
          q: fVal
        }),
        {name: fVal},
        function (ft) { $scope.article.feature_type = ft.name; $('#feature-type-container').removeClass('newtag'); },
        function (value) { $scope.article.feature_type = value.name; $('#feature-type-container').addClass('newtag'); },
        function (data, status) { if (status === 403) { Login.showLoginModal(); } }
      );
    };

    $scope.authorDisplayFn = function (o) {
      return (o.first_name && o.last_name && o.first_name + ' ' + o.last_name) || 'username: ' + o.username;
    };

    $scope.authorCallback = function (o, input) {
      for (var t in $scope.article.authors) {
        if ($scope.article.authors[t].id === o.id) { return; }
      }
      $scope.article.authors.push(o);
      $(input).val('');
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

      $scope.article.title = $scope.editors.content_title_editor.getContent();
      if ($scope.article.status !== 'Published') {
        $scope.article.slug = $window.URLify($scope.article.title, 50);
      }
      $scope.article.subhead = $scope.editors.content_subhead_editor.getContent();

      if ($scope.editors.content_body_editor) {
        $scope.article.body = $scope.editors.content_body_editor.getContent();
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
      if (data.status === 403) {
        //gotta get them to log in
        Login.showLoginModal();
        $(navbarSave).html(saveHTML);
        return;
      }
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
      $scope.article = _.clone(resp);
      $scope.last_saved_article = _.clone(resp);
      $scope.errors = null;
      $location.search('rating_type', null); //maybe just kill the whole query string with $location.url($location.path())
      $scope.saveArticleDeferred.resolve(resp);
    }

    $scope.displayAuthorAutocomplete = function (obj) {
      return obj.first_name + ' ' + obj.last_name;
    };

    $scope.$watch('article', function(){
      if(_.isEqual($scope.article, $scope.last_saved_article)){
        $scope.articleIsDirty = false;
      }else{
        $scope.articleIsDirty = true;
      }
    }, true);

    $scope.$watch('articleIsDirty', function(){
      if($scope.articleIsDirty){
        window.onbeforeunload = function () {
          return 'You have unsaved changes. Do you want to continue?';
        };
      }else{
        window.onbeforeunload = function () {};
      }
    });

    $('#extra-info-modal').on('shown.bs.modal', function () { $window.picturefill(); });

    $scope.initEditor = function (name, id, options, articleField) {
      $scope.editors = $scope.editors || {};
      $scope.editors[name] = new window.Editor(options);
      angular.element(id + ' .editor').bind('input', function () {
        $scope.article[articleField] = $scope.editors[name].getContent();
        $scope.$apply();
      });


    };

    //exporting this to global so editor snippets can self-instantiate
    $window.initEditor = $scope.initEditor;

    $scope.$on('$destroy', function () {
      for (var editor in $scope.editors) {
        $scope.editors[editor].destroy();
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
