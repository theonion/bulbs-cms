'use strict';

angular.module('bulbsCmsApp')
  .controller('ContenteditCtrl', function (
    $scope, $http, $window, $location,
    $timeout, $compile, $q, $, IfExistsElse,
    routes, Contenteditservice, content)
  {

    console.log("content edit here")
    console.log(content)

    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.CONTENT_PARTIALS_URL = routes.CONTENT_PARTIALS_URL;
    $scope.MEDIA_ITEM_PARTIALS_URL = routes.MEDIA_ITEM_PARTIALS_URL;
    $scope.CACHEBUSTER = routes.CACHEBUSTER;


    var getArticleCallback = function (data) {
      $window.article = data;
      $scope.article = data;
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
    }
    getArticleCallback(content);

    //set title
    $window.document.title = 'AVCMS | Editing ' + ($scope.article && $('<span>' + $scope.article.title + '</span>').text());

    $('body').removeClass();

    $scope.tagDisplayFn = function (o) {
      return o.name;
    };

    $scope.tagCallback = function (o, input, freeForm) {
      var tagVal = freeForm ? o : o.name;
      IfExistsElse.ifExistsElse(
        '/cms/api/v1/tag/?ordering=name&search=' + encodeURIComponent(tagVal),
        {name: tagVal},
        function (tag) { $scope.article.tags.push(tag); },
        function (value) { $scope.article.tags.push({name: value.name, type: 'content_tag', new: true}); },
        function (data, status) { if (status === 403) { $scope.showLoginModal(); } }
      );
      $(input).val('');
    };

    $scope.sectionCallback = function (o, input, freeForm) {
      var tagVal = freeForm ? o : o.name;
      IfExistsElse.ifExistsElse(
        '/cms/api/v1/tag/?ordering=name&search=' + encodeURIComponent(tagVal),
        {name: tagVal},
        function (tag) { $scope.article.tags.push(tag); },
        function () { console.log('Can\'t create sections.'); },
        function (data, status) { if (status === 403) { $scope.showLoginModal(); } }
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
        '/cms/api/v1/things/?type=feature_type&q=' + encodeURIComponent(fVal),
        {name: fVal},
        function (ft) { $scope.article.feature_type = ft.name; $('#feature-type-container').removeClass('newtag'); },
        function (value) { $scope.article.feature_type = value.name; $('#feature-type-container').addClass('newtag'); },
        function (data, status) { if (status === 403) { $scope.showLoginModal(); } }
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
            '/reviews/api/v1/tvseason/?season=' + identifier + '&show=' + encodeURIComponent(show),
            {identifier: identifier, show: show},
            mediaItemExistsCbkFactory(i),
            mediaItemDoesNotExistCbkFactory(i),
            saveArticleErrorCbk
          );
        } else if (data.ratings[i].type === 'tvepisode') {
          show = data.ratings[i].media_item.show;
          var season = data.ratings[i].media_item.season;
          var episode = data.ratings[i].media_item.episode;
          // var title = data.ratings[i].media_item.title;
          IfExistsElse.ifExistsElse(
            '/reviews/api/v1/tvepisode/?show=' + encodeURIComponent(show) + '&season=' + season + '&episode=' + episode,
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
    };

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

    function saveMediaItem(index) {
      var type = $scope.article.ratings[index].type;
      var media_item = $scope.article.ratings[index].media_item;
      var url = '/reviews/api/v1/' + type + '/';
      var method = 'POST';
      if (media_item.id) {
        url += media_item.id + '/';
        method = 'PUT';
      }
      $http({
        url: url,
        method: method,
        data: media_item
      }).success(function (resp) {
        $scope.article.ratings[index].media_item = resp;
        $scope.mediaItemCallbackCounter -= 1;
      }).error(saveArticleErrorCbk);
    }

    function saveToContentApi() {
      $('#save-article-btn').html('<i class=\'fa fa-refresh fa-spin\'></i> Saving');

      $http({
        url: '/cms/api/v1/content/' + ($scope.article.id || '') + '/',
        method: 'PUT',
        data: $scope.article
      }).success(saveArticleSuccessCbk).error(saveArticleErrorCbk);

    }

    function saveArticleErrorCbk(data, status) {
      if (status === 403) {
        //gotta get them to log in
        $scope.showLoginModal();
        $('#save-article-btn').html('Save');
        return;
      }
      $('#save-article-btn').html('<i class=\'fa fa-frown-o\' style=\'color:red\'></i> Error!');
      if (status === 400) {
        $scope.errors = data;
      }
      $scope.saveArticleDeferred.reject();
    }

    function saveArticleSuccessCbk(resp) {
      $('#save-article-btn').html('<i class=\'fa fa-check\' style=\'color:green\'></i> Saved!');
      setTimeout(function () {
          $('#save-article-btn').html('Save');
        }, 1000);
      $scope.article = resp;
      $scope.errors = null;
      $location.search('rating_type', null); //maybe just kill the whole query string with $location.url($location.path())
      dirtGone();
      $scope.saveArticleDeferred.resolve(resp);
    }

    $scope.displayAuthorAutocomplete = function (obj) {
      return obj.first_name + ' ' + obj.last_name;
    };

    function waitForDirt() {
      $('.edit-page').one('change input', 'input,div.editor', function () {
        //listen for any kind of input or change and bind a onbeforeunload event
        window.onbeforeunload = function () {
          return 'You have unsaved changes. Leave anyway?';
        };
      });
    }

    function dirtGone() {
      window.onbeforeunload = function () {};
    }
    waitForDirt();

    $('#extra-info-modal').on('shown.bs.modal', function () { $window.picturefill(); });

    $scope.initEditor = function (name, id, options, articleField) {
      $scope.editors = $scope.editors || {};
      $scope.editors[name] = new window.Editor(options);
      angular.element(id + ' .editor').bind('input', function () {
        $scope.article[articleField] = $scope.editors[name].getContent();
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
      Contenteditservice.get().then(getArticleCallback);
    };

    $scope.trashSuccessCbk = function () {
      //delaying this so the user isn't sent back before the trashed content is removed from the listing view
      $timeout(function () {
        $window.history.back();
      }, 1500);
    };

  });
