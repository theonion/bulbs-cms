(function( w ){
    /* We can request an image at every possible width, but let's limit it to a reasonable number
       We can set these so they correspond to our more common sizes.
    */
    function tmpl(text, dict) {
        for (var k in dict) {
            text = text.replace("{{" + k + "}}", dict[k]);
        }
        return text;
    }
    w.picturefill = function(element) {
        var ps;
        if (element && element.getAttribute('data-type') === 'image') {
          ps = [element];
        }
        else { 
          if (typeof element === "undefined") {
            element = w.document;
          }
          ps = element.getElementsByTagName( "div" );
        }

        var imageData = [];
        for( var i = 0, il = ps.length; i < il; i++ ){
            var el = ps[i];
            if(el.getAttribute( "data-type" ) !== "image" ){
                continue;
            }
            var div = el.getElementsByTagName( "div" )[0];
            if( el.getAttribute( "data-image-id" ) !== null ){
                var id = el.getAttribute( "data-image-id" ),
                    crop = el.getAttribute( "data-crop" );
                var _w = div.offsetWidth,
                    _h = div.offsetHeight;

                if (!crop || crop === "" || crop === "auto") {
                    crop = computeAspectRatio(_w, _h);
                }
                if (el.getAttribute("data-format")) {
                    format = el.getAttribute("data-format");
                }
                else {
                    format = "jpg";
                }

                var element = div;
                if (id) {
                    $(".image-css-" + id).remove();
                    $.ajax({
                        url: w.BC_ADMIN_URL + '/api/' + id,
                        headers: {
                            'X-Betty-Api-Key': w.BC_API_KEY,
                            'Content-Type': undefined
                        },
                        success: $.proxy(function (res) {
                            var imageData = res;
                            if (this.crop === "original") {
                                createStyle('.image[data-image-id="' + this.id + '"]>div', {
                                        'padding-bottom':  ((res.height / res.width) * 100) + '%'
                                }, "image-css-" + this.id);

                                var cropDetails = {x0:0, x1:res.width, y0:0, y1:res.height};
                            }
                            else {
                                var cropDetails = imageData.selections[this.crop]
                            }
                            
                            computeStyle(this.element, imageData, cropDetails)
                        }, {element: element, id: id, crop:crop}),
                        error: $.proxy(function() {
                            if (this.crop === "original") {
                                //default to 16x9
                                createStyle('.image[data-image-id="' + this.id + '"]>div', {
                                    'padding-bottom':  '56.25%', // default to 16x9 for errors
                                    'background-color':'rgba(200, 0,0, .5)'
                                }, "image-css-" + this.id);
                            }
                        }, {id: id, crop:crop})
                    });
                }
            }
        }
    };

    function computeStyle(element, image, selection) {
        var selector = '.image[data-image-id="' + image.id + '"]>div';
        var elementWidth = $(selector).width();

        var scale, styles,
        elementHeight = (image.height / image.width) * elementWidth,
        s_width = selection.x1 - selection.x0,
        s_height = selection.y1 - selection.y0,
        tmp_selection = selection;
        

        if (!s_width || !s_height) {
          /*
              If we have bogus selections, make
              the crop equal to the whole image
          */
          s_width = elementWidth;
          s_height = elementHeight;
          tmp_selection = {
            'x0': 0,
            'y0': 0,
            'x1': s_width,
            'y1': s_height
          };
        }

        var imageUrl = w.BC_ADMIN_URL + '/' + image.id + '/original/1200.jpg';
        scale = elementWidth / s_width;

        var rules = {
            'background-image': 'url(' + imageUrl +')',
            'background-size': scaleNumber(image.width, scale) + 'px',
            'background-position':
              '-' + scaleNumber(tmp_selection.x0, scale) + 'px ' +
              '-' + scaleNumber(tmp_selection.y0, scale) + 'px',
            'background-repeat': 'no-repeat'
          }
        createStyle(selector, rules,  "image-css-" + image.id);
    }

    function createStyle(selector, rules, classname) {
        var styleNode = document.createElement("style");
        styleNode.type = "text/css";
        styleNode.className = classname;
        var css = "";
        
        var temp = "" + selector + '{';
        for (var rule in rules) {
            temp += rule + ':' + rules[rule] + ';';
        }
        temp += '}';
        css += temp;
    
        if (styleNode.styleSheet) {
            styleNode.styleSheet.cssText = css;
        } else {
            styleNode.appendChild(document.createTextNode(css));
        }
        $(document).find("head").append(styleNode);
    }


    function scaleNumber(num, by_scale) {
      return Math.floor(num * by_scale);
    };


    function computeAspectRatio(_w, _h) {
        if (_w !== 0 && _h !== 0) {
            var aspectRatio = Math.ceil(_w/_h * 10);
            //smooth out rounding issues.
            switch (aspectRatio) {
                case 30:
                case 31:
                    crop = "3x1";
                    break;
                case 20:
                    crop = "2x1";
                    break;
                case 14:
                    crop = "4x3";
                    break;
                case 18:
                    crop = "16x9";
                    break;
                case 8:
                    crop = "3x4";
                    break;
                case 10:
                    crop = "1x1";
                    break;
                default:
                    crop = "original";
            }
            return crop;
        }
        else {
            return "16x9"
        }
    }


}( this ));;
'use strict';
/*

Image

This bridges the embed module that the editor exposes & our custom image implementation.

*/


/* prevents backspace from accidentally triggering a back event */

$(document).unbind('keydown').bind('keydown', function (event) {
  var doPrevent = false;
  if (event.keyCode === 8) {
    var d = event.srcElement || event.target;
    if (['TEXTAREA', 'INPUT'].indexOf(d.tagName.toUpperCase() !==  -1)) {
      doPrevent = d.readOnly || d.disabled;
    }
    //we're in a content editable field
    else if (d.isContentEditable) {
      doPrevent = false;
    } else {
      doPrevent = true;
    }
  }
  if (doPrevent) {
    event.preventDefault();
  }
});

'use strict';

// ****** External Libraries ****** \\

angular.module('underscore', []).value('_', window._);
angular.module('NProgress', []).value('NProgress', window.NProgress);
angular.module('URLify', []).value('URLify', window.URLify);
angular.module('jquery', []).value('$', window.$);
angular.module('moment', []).value('moment', window.moment);
angular.module('PNotify', []).value('PNotify', window.PNotify);
angular.module('keypress', []).value('keypress', window.keypress);
angular.module('Raven', []).value('Raven', window.Raven);

// ****** App Config ****** \\

angular.module('bulbsCmsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'restangular',
  'BettyCropper',
  'jquery',
  'underscore',
  'NProgress',
  'URLify',
  'moment',
  'PNotify',
  'keypress',
  'Raven'
])
.config(function ($locationProvider, $routeProvider, $sceProvider, routes) {
  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/cms/app/list/', {
      templateUrl: routes.PARTIALS_URL + 'contentlist.html',
      controller: 'ContentlistCtrl',
      reloadOnSearch: false
    })
    .when('/cms/app/edit/:id/', {
      templateUrl: routes.PARTIALS_URL + 'contentedit.html',
      controller: 'ContenteditCtrl',
    })
    .when('/cms/app/promotion/', {
      templateUrl:  routes.PARTIALS_URL + 'promotion.html',
      controller: 'PromotionCtrl',
      reloadOnSearch: false
    })
    .when('/cms/app/targeting/', {
      templateUrl: routes.PARTIALS_URL + 'targeting-editor.html',
      controller: 'TargetingCtrl'
    })
    .when('/cms/app/pzones/', {
      templateUrl: routes.PARTIALS_URL + 'pzones.html',
      controller: 'PzoneCtrl'
    })
    .otherwise({
      redirectTo: '/cms/app/list/'
    });

  //TODO: whitelist staticonion.
  $sceProvider.enabled(false);
  /*.resourceUrlWhitelist([
  'self',
  STATIC_URL + "**"]);*/

})
.config(function ($provide, $httpProvider) {
  $provide.decorator('$exceptionHandler', function ($delegate) {
    return function (exception, cause) {
      $delegate(exception, cause);
      window.Raven.captureException(exception);
    };
  });

  $httpProvider.interceptors.push('BugReportInterceptor');
  $httpProvider.interceptors.push('PermissionsInterceptor');

})
.run(function ($rootScope, $http, $cookies) {
  // set the CSRF token here
  $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
  var deleteHeaders = $http.defaults.headers.delete || {};
  deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
  $http.defaults.headers.delete = deleteHeaders;
});


'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $window, $q, $, _, moment, ContentApi,
    LOADING_IMG_SRC, routes)
  {
    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;

    var getContentCallback = function (data) {
        $scope.articles = data;
        $scope.totalItems = data.metadata.count;
      };

    $scope.getContent = function (params, merge) {
        params = params || {};
        if (merge) {
          var curParams = $location.search();
          params = $.extend(true, curParams, params);
        }

        $location.search(params);
        $scope.pageNumber = $location.search().page || '1';

        ContentApi.all('content').getList(params)
          .then(getContentCallback);
      };

    function updateIsMyStuff() {
        if (!$location.search().authors) {
          $scope.myStuff = false;
          return;
        }
        var authors = $location.search().authors;
        if (typeof(authors) === 'string') {
          authors = [authors];
        }
        if (authors.length === 1 && authors[0] === $window.current_user) {
          $scope.myStuff = true;
        } else {
          $scope.myStuff = false;
        }
      }
    updateIsMyStuff();
    $scope.getContent();

    $scope.$on('$routeUpdate', function () {
        updateIsMyStuff();
      });

    $('#meOnly').on('switch-change', function (e, data) {
        var value = data.value;
        if (value === true) {
          $scope.getContent({authors: [$window.current_user]});
        } else if (value === false) {
          $scope.getContent();
        }
      });

    $scope.goToPage = function () {
        $scope.getContent({'page': $scope.pageNumber}, true);
      };

    $scope.publishSuccessCbk = function (data) {
        var i;
        for (i = 0; i < $scope.articles.length; i++) {
          if ($scope.articles[i].id === data.article.id) {
            break;
          }
        }

        for (var field in data.response) {
          $scope.articles[i][field] = data.response[field];
        }

        return $q.when();
      };

    $scope.trashSuccessCbk = function () {
        $timeout(function () {
            $scope.getContent();
            $('#confirm-trash-modal').modal('hide');
          }, 1500);
      };

    $('.expcol').click(function (e) {
        e.preventDefault();
        var nS = $(this).attr('state') === '1' ? '0' : '1',
            i = nS ? 'minus' : 'plus',
            t = nS ? 'Collapse' : 'Expand',
            tP = $($(this).attr('href')).find('.panel-collapse');

        if ($(this).attr('state') === '0') { tP.collapse('show'); }
        else { tP.collapse('hide'); }
        $(this).html('<i class=\"fa fa-' + i + '-circle\"></i> ' + t + ' all');
        $(this).attr('state', nS);
        $window.picturefill();
      });

  })
  .directive('ngConfirmClick', [ // Used on the unpublish button
    function () {
      return {
        link: function (scope, element, attr) {
          var msg = attr.ngConfirmClick || 'Are you sure?';
          var clickAction = attr.confirmedClick;
          element.bind('click', function () {
            if (window.confirm(msg)) {
              scope.$eval(clickAction);
            }
          });
        }
      };
    }
  ]);

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

    $scope.$watch('article.title', function () {
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
        if (data.last_modified &&
          $scope.article.last_modified &&
          moment(data.last_modified) > moment($scope.article.last_modified)) {
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
        } else {
          $scope.postValidationSaveArticle();
        }
      });

      return $scope.saveArticleDeferred.promise;

    };

    var listener = new keypress.Listener();
    listener.simple_combo('cmd s', function (e) { $scope.saveArticle(); });
    listener.simple_combo('ctrl s', function (e) { $scope.saveArticle(); });

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
            {show: show, season: season, episode: parseInt(episode)},
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

    var saveHTML =  '<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save';
    var navbarSave = '.navbar-save';

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

    $scope.$watch('article', function () {
      if (angular.equals($scope.article, $scope.last_saved_article)) {
        $scope.articleIsDirty = false;
      } else {
        $scope.articleIsDirty = true;
      }
    }, true);

    $scope.$watch('articleIsDirty', function () {
      if ($scope.articleIsDirty) {
        $window.onbeforeunload = function () {
          return 'You have unsaved changes. Do you want to continue?';
        };
      } else {
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

    var backupInterval = (function () {
      var interval = 60000; //1 minute
      return $interval(Localstoragebackup.backupToLocalStorage, interval);
    })();

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('PromotionCtrl', function ($scope, $window, $location, $, _, ContentApi, PromotionApi, Login, promo_options, routes, Raven) {
    $window.document.title = routes.CMS_NAMESPACE + ' | Promotion Tool'; // set title

    $scope.$watch('pzone', function (pzone) {
      if (pzone && pzone.content && pzone.content.length) {
        $scope.lastSavedPromotedArticles = _.clone(pzone.content.slice(0));
        $scope.promotedArticles = pzone.content.slice(0);
      } else {
        $scope.promotedArticles = [{
          hey_checkthis: true,
          title: 'Nothing Promoted!',
          feature_type: 'Click an article on the right and use \'Insert\''
        }];
      }
    });

    $scope.$watch('promotedArticles', function () {
      if (_.isEqual($scope.promotedArticles, $scope.lastSavedPromotedArticles)) {
        $scope.promotedArticlesDirty = false;
      } else {
        $scope.promotedArticlesDirty = true;
      }
    }, true);

    $scope.getPzones = function () {
      ContentApi.all('contentlist').getList()
        .then(function (data) {
          $scope.pzones = data;
          $scope.pzone = data[0];
        })
        .catch(function (data) {
          alert('Content list does not exist.');
        });
    };

    var getContentCallback = function (data) {
      $scope.articles = data;
      $scope.totalItems = data.metadata.count;
    };

    $scope.getContent = function () {
      var params = {published: true};
      var search = $location.search();
      for (var prop in search) {
        if (!search.hasOwnProperty(prop)) {
          continue;
        }
        var val = search[prop];
        if (!val || val === 'false') {
          continue;
        }
        params[prop] = val;
      }
      ContentApi.all('content').getList(params)
        .then(getContentCallback);
    };

    $scope.$on('$viewContentLoaded', function () {
      $scope.getPzones();
      $scope.getContent();
    });

    $scope.articleIsInPromotedArticles = function (id) {
      if ($scope.promotedArticles) {
        for (var i in $scope.promotedArticles) {
          if ($scope.promotedArticles[i].id === id) {
            return true;
          }
        }
      }
      return false;
    };

    var pA = $('.promotion-area'),
      pC = $('.promotion-container');

    $scope.insertArticleMode = function (article) {
      $scope.selectedArticle = article;

      pA.addClass('select-mode');
      pC.off('click');
      pC.on('click', '.promotion-area.select-mode .article-container', function (e) {
        var index = $(this).parents('[data-index]').data('index') - 0;
        $scope.insertArticle(index);
        pA.removeClass('select-mode');
        $scope.$apply();
      });
    };

    $scope.insertArticle = function (index) {
      var limit = promo_options.upper_limits[$scope.pzone.name];
      if (!$scope.promotedArticles[index] || !$scope.promotedArticles[index].id) {
        $scope.promotedArticles.splice(index, 1, $scope.selectedArticle);
      }
      else { $scope.promotedArticles.splice(index, 0, $scope.selectedArticle); }
      if (limit && $scope.promotedArticles.length > limit) {
        $scope.promotedArticles.pop($scope.promotedArticles.length);
      }
    };

    $scope.replaceArticleMode = function (article) {
      $scope.selectedArticle = article;

      pA.addClass('select-mode');
      pC.off('click');
      pC.on('click', '.promotion-area.select-mode .article-container', function (e) {
        var index = $(this).parents('[data-index]').data('index');
        $scope.replaceArticle(index);
        pA.removeClass('select-mode');
        $scope.$apply();
      });
    };

    $scope.replaceArticle = function (index) {
      $scope.promotedArticles.splice(index, 1, $scope.selectedArticle);
    };

    $scope.save = function () {
      var items = $scope.promotedArticles.slice(0); //copy
      if (!items[0].id) {
        items.shift();
      }

      var oldSaveHtml = $('.save-button').html();
      $('.save-button').html('<i class="fa fa-refresh fa-spin"></i> Saving');

      var payload = $scope.pzone;
      if ($scope.promotedArticles[0].hey_checkthis) {
        payload.content = [];
      } else {
        payload.content = $scope.promotedArticles;
      }
      var pzone = ContentApi.restangularizeElement(null, payload, 'contentlist');
      return pzone.put().then(function (data) {
        $scope.lastSavedPromotedArticles = _.clone(data.content);
        $scope.promotedArticles = data.content;
        $('.save-button').html(oldSaveHtml);
      }, function (data) {
        Raven.captureMessage('Error Saving Pzone', {extra: data});
        $('.save-button').html('<i class="fa fa-times-circle"></i> Error');
      });
    };

    $scope.moveUp = function (index) {
      if (index === 0) { return; }
      var toMove = $scope.promotedArticles[index];
      $scope.promotedArticles[index] = $scope.promotedArticles[index - 1];
      $scope.promotedArticles[index - 1] = toMove;
    };

    $scope.moveDown = function (index) {
      if (index === $scope.promotedArticles.length - 1) { return; }
      var toMove = $scope.promotedArticles[index];
      $scope.promotedArticles[index] = $scope.promotedArticles[index + 1];
      $scope.promotedArticles[index + 1] = toMove;
    };

    $scope.remove = function (index) {
      $scope.promotedArticles.splice(index, 1);
    };


  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('TargetingCtrl', function ($scope, $http, $window, $q, $location, tar_options, NProgress, routes) {
    $window.document.title = routes.CMS_NAMESPACE + ' | Targeting Editor';

    NProgress.configure({
      minimum: 0.4
    });

    var canceller;
    $scope.search = function (url) {
      if (!url) { return; }

      if (typeof(canceller) === 'undefined') {
        canceller = $q.defer();
      } else {
        canceller.resolve();
        NProgress.set(0);
        canceller = $q.defer();
      }

      NProgress.start();

      $http({
        method: 'GET',
        url: tar_options.endpoint,
        timeout: canceller.promise,
        params: {url: $scope.url}
      }).success(function (data) {
        $scope.targetingArray = [];
        for (var k in data) {
          $scope.targetingArray.push([k, data[k]]);
        }
        NProgress.done();
      }).error(function (data, status, headers, config) {
        if (status === 404) {
          $scope.targetingArray = [];
          $scope.targetingArray.push(['', '']);
          NProgress.done();
        }
      });
    };

    $scope.save = function () {
      var data = {};
      for (var i in $scope.targetingArray) {
        data[$scope.targetingArray[i][0]] = $scope.targetingArray[i][1];
      }

      return $http({
        method: 'POST',
        url: tar_options.endpoint + '?url=' + $scope.url,
        data: data
      }).success(function (data) {
        $scope.targetingArray = [];
        for (var k in data) {
          $scope.targetingArray.push([k, data[k]]);
        }
      });

    };

    $scope.keyHandler = function (event, url) {
      if (event.keyCode === 13) { // enter
        this.search(url);
      } else if (event.keyCode === 27) { // escape
        event.currentTarget.value = '';
      }
    };

    //grab url query key
    var search = $location.search();
    if (search && search.url) {
      $scope.url = decodeURIComponent(search.url);
    }
  }
);

'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentworkflowCtrl', function ($scope, $http, $modal, $window, moment, routes, TIMEZONE_LABEL) {
    $scope.TIMEZONE_LABEL = TIMEZONE_LABEL;

    $scope.trashContentModal = function (articleId) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/confirm-trash-modal.html',
        controller: 'TrashcontentmodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function () { return articleId; }
        }
      });
    };

    $scope.pubTimeModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/choose-date-modal.html',
        controller: 'PubtimemodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.sendToEditorModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/send-to-editor-modal.html',
        controller: 'SendtoeditormodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.changelogModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/changelog-modal.html',
        controller: 'ChangelogmodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.thumbnailModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/thumbnail-modal.html',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    //deprecated
    $scope.sponsoredContentModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/sponsored-content-modal.html',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.sponsorModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/sponsor-modal.html',
        scope: $scope,
        controller: 'SponsormodalCtrl',
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.versionBrowserModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/version-browser-modal.html',
        controller: 'VersionbrowsermodalCtrl',
        scope: $scope,
        size: 'lg',
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.getStatus = function (article) {
      if (!article || !article.published) {
        return 'unpublished';
      } else if (moment(article.published) > moment()) {
        return 'scheduled';
      } else {
        return 'published';
      }
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $, Login, articleId, Raven) {
    console.log('trash content modal ctrl here');
    console.log(articleId);

    $scope.deleteButton = {
      idle: 'Delete',
      busy: 'Trashing',
      finished: 'Trashed',
      error: 'Error!'
    };

    $scope.trashContent = function () {
      console.log('trash content here');
      return $http({
        'method': 'POST',
        'url': '/cms/api/v1/content/' + articleId + '/trash/'
      });
    };

    $scope.trashCbk = function (trash_promise) {
      trash_promise
        .then(function (result) {
          console.log('trash success');
          $scope.trashSuccessCbk();
          $modalInstance.close();
        })
        .catch(function (reason) {
          if (reason.status === 404) {
            $scope.trashSuccessCbk();
            $modalInstance.close();
            return;
          }
          Raven.captureMessage('Error Deleting Article', {extra: reason});
          $modalInstance.dismiss();
        });
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, moment, Login, routes, article, TIMEZONE_OFFSET, Raven) {
    $scope.article = article;

    $scope.pubButton = {
      idle: 'Publish',
      busy: 'Publishing',
      finished: 'Published!',
      error: 'Error!'
    };

    $scope.$watch('pickerValue', function (newVal) {
      var pubTimeMoment = moment(newVal).zone(TIMEZONE_OFFSET);
      $scope.datePickerValue = moment()
        .year(pubTimeMoment.year())
        .month(pubTimeMoment.month())
        .date(pubTimeMoment.date());
      $scope.timePickerValue = moment()
        .hour(pubTimeMoment.hour())
        .minute(pubTimeMoment.minute());
    });

    var viewDateFormat = 'MM/DD/YYYY hh:mm a';
    var modelDateFormat = 'YYYY-MM-DDTHH:mmZ';

    $scope.setTimeShortcut = function (shortcut) {
      if (shortcut === 'now') {
        var now = moment().zone(TIMEZONE_OFFSET);
        $scope.pickerValue = now;
      }
      if (shortcut === 'midnight') {
        var midnight = moment().zone(TIMEZONE_OFFSET).hour(24).minute(0);
        $scope.pickerValue = midnight;
      }
    };

    $scope.setDateShortcut = function (shortcut) {
      var today = moment().zone(TIMEZONE_OFFSET);
      if (shortcut === 'today') {
        $scope.datePickerValue = moment().year(today.year()).month(today.month()).date(today.date());
      }
      if (shortcut === 'tomorrow') {
        $scope.datePickerValue = moment().year(today.year()).month(today.month()).date(today.date() + 1);
      }
    };

    $scope.setPubTime = function () {
      //we're planning on making feature_type a db required field
      //but for now we're just validating on the front-end on publish
      if (!$scope.article.feature_type) {
        $modalInstance.dismiss();
        $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/pubtime-validation-modal.html'
        });
        return;
      }

      var newDate = moment($scope.datePickerValue);
      var newTime = moment($scope.timePickerValue);
      var newDateTime = moment().zone(TIMEZONE_OFFSET)
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date())
        .hour(newTime.hour())
        .minute(newTime.minute())
        .format(modelDateFormat);
      var data = {published: newDateTime};

      return $http({
        url: '/cms/api/v1/content/' + $scope.article.id + '/publish/',
        method: 'POST',
        data: data
      });
    };

    $scope.setPubTimeCbk = function (publish_promise) {
      publish_promise
        .then(function (result) {
          $scope.article.published = result.data.published;
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: result.data});
          }
          $modalInstance.close();
        })
        .catch(function (reason) {
          Raven.captureMessage('Error Setting Pubtime', {extra: reason.data});
          $modalInstance.dismiss();
        });
    };

    $scope.unpubButton = {
      idle: 'Unpublish',
      busy: 'Unpublishing',
      finished: 'Unpublished!',
      error: 'Error'
    };


    $scope.unpublish = function () {
      return $http({
        url: '/cms/api/v1/content/' + $scope.article.id + '/publish/',
        method: 'POST',
        data: {published: false}
      });
    };

    $scope.unpublishCbk = function (unpub_promise) {
      unpub_promise
        .then(function (result) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: result.data});
          }
          $modalInstance.close();
        })
        .catch(function (reason) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: reason.data});
          }
          $modalInstance.dismiss();
        });
    };

    if ($scope.article.published) {
      $scope.pickerValue = moment($scope.article.published);
    } else {
      $scope.setTimeShortcut('now');
    }

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, img_ref, cropsToEdit, DEFAULT_IMAGE_WIDTH) {
    $scope.cropMode = false;
    $scope.thumb = {height: 170, width: 170};
    $scope.crop_image = {height: 400, width: 550};
    $scope.img_ref = angular.copy(img_ref);

    $scope.image_url = BettyCropper.origJpg($scope.img_ref.id, DEFAULT_IMAGE_WIDTH);

    var setupCropper = function () {
      $('#crop-image').Jcrop({
        allowSelect: false,
        allowMove: true,
        allowResize: true,
        addClass: 'jcrop-centered',
        keySupport: false
      }, function () { // Jcrop Init Callback
        $scope.jcrop_api = this;
      });
    };

    $scope.processJcropSelection = function (s) {
      if (
        angular.isNumber(s.x) && !isNaN(s.x) ||
        angular.isNumber(s.y) && !isNaN(s.y) ||
        angular.isNumber(s.x2) && !isNaN(s.x2) ||
        angular.isNumber(s.y2) && !isNaN(s.y2) ||
        angular.isNumber(s.w) && !isNaN(s.w) ||
        angular.isNumber(s.h) && !isNaN(s.h)
      ) {
        var selection = {};

        var length;
        if ($scope.image.width > $scope.image.height) {
          length = 'width';
        } else {
          length = 'height';
        }
        var scale = $scope.crop_image[length] / $scope.image[length];
        selection.x0 = roundSelection($scope.scaleNumber(s.x, 1 / scale), $scope.image.width);
        selection.y0 = roundSelection($scope.scaleNumber(s.y, 1 / scale), $scope.image.height);
        selection.x1 = roundSelection($scope.scaleNumber(s.x2, 1 / scale), $scope.image.width);
        selection.y1 = roundSelection($scope.scaleNumber(s.y2, 1 / scale), $scope.image.height);
        selection.source = 'user';

        $scope.image.selections[$scope.selectedCrop[0]] = selection;
        $scope.thumb_styles[$scope.selectedCrop[0]] = $scope.computeThumbStyle(
          $scope.image,
          $scope.thumb,
          selection
        );
      }
    };

    function roundSelection(number, max) {
      if (number < 0) { return 0; }
      if (number > max) { return max; }
      return number;
    }

    $scope.setSelectedCrop = function (ratio, selection) {
      $scope.cropMode = true;
      if (angular.isUndefined($scope.jcrop_api)) {
        $timeout(setupCropper, 0).then(function () { // WHY DO I NEED A TIMEOUT
          $scope.selectedCrop = [ratio, selection];
        });
      } else {
        $scope.selectedCrop = [ratio, selection];
      }
    };

    $scope.setFirstUncomputedCrop = function () {
      if ($scope.uncomputedCrops.length) {
        $scope.setSelectedCrop(
          $scope.uncomputedCrops[0],
          $scope.image.selections[$scope.uncomputedCrops[0]]
        );
      } else {
        $scope.setSelectedCrop(
          $scope.ratioOrder[0],
          $scope.image.selections[$scope.ratioOrder[0]]
        );
      }
    };

    $scope.$watch('selectedCrop', function (newVal) {
      if (angular.isUndefined(newVal)) {  return;  }

      var length;
      if ($scope.image.width > $scope.image.height) {
        length = 'width';
      } else {
        length = 'height';
      }
      var scale = $scope.crop_image[length] / $scope.image[length];
      var selection = newVal[1];
      var ratioNums = newVal[0].split('x');

      $scope.currentCrop = newVal[0];

      $scope.jcrop_api.setOptions({
        aspectRatio: ratioNums[0] / ratioNums[1]
      });

      $scope.jcrop_api.setSelect([
        $scope.scaleNumber(selection.x0, scale),
        $scope.scaleNumber(selection.y0, scale),
        $scope.scaleNumber(selection.x1, scale),
        $scope.scaleNumber(selection.y1, scale)
      ]);

    });

    $scope.setThumbStyles = function (image, selections) {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in selections) {
        $scope.thumb_styles[ratio] = $scope.computeThumbStyle(
          image, $scope.thumb, selections[ratio]
        );
      }
    };

    $scope.computeThumbStyle = function (image, thumb, selection) {
      var scale, styles, h_or_w, selection_length,
      s_width = selection.x1 - selection.x0,
      s_height = selection.y1 - selection.y0;
      if (s_width < s_height) {
        h_or_w = 'height';
        selection_length = s_height;
      } else {
        h_or_w = 'width';
        selection_length = s_width;
      }

      styles = {};
      scale = thumb[h_or_w] / selection_length;
      styles['background'] = 'url(' + $scope.image_url + ')';
      styles['background-size'] = $scope.scaleNumber($scope.image.width, scale) + 'px';
      styles['background-position'] = '' +
        '-' + $scope.scaleNumber(selection.x0, scale) + 'px ' +
        '-' + $scope.scaleNumber(selection.y0, scale) + 'px';
      styles['background-repeat'] = 'no-repeat';
      styles['height'] = $scope.scaleNumber(s_height, scale) + 'px';
      styles['width'] = $scope.scaleNumber(s_width, scale) + 'px';
      styles['top'] = '50%';
      styles['margin-top'] = '-' + ($scope.scaleNumber(s_height, scale) / 2) + 'px';

      return styles;
    };

    $scope.computeImageTagStyle = function (image, thumb) {
      var styles = {};

      if (image.width > image.height) {
        styles.width = thumb.width;
      } else {
        styles.height = thumb.height;
      }

      return styles;
    };

    $scope.scaleNumber = function (num, by_scale) {
      return Math.floor(num * by_scale);
    };

    $scope.saveAndQuit = function () {
      // Should probably use a save directive here
      $scope.processJcropSelection($scope.jcrop_api.tellSelect());
      BettyCropper.updateSelection(
        $scope.image.id,
        $scope.selectedCrop[0],
        $scope.image.selections[$scope.selectedCrop[0]]
      ).success(function (data) {
        $scope.cropMode = false;
      });
    };

    $scope.saveAndNext = function () {
      $scope.processJcropSelection($scope.jcrop_api.tellSelect());
      BettyCropper.updateSelection(
        $scope.image.id,
        $scope.selectedCrop[0],
        $scope.image.selections[$scope.selectedCrop[0]]
      ).success(function (data) {
        if ($scope.uncomputedCrops.length) {
          $scope.setSelectedCrop(
            $scope.uncomputedCrops[0],
            $scope.image.selections[$scope.uncomputedCrops[0]]
          );
        } else {
          $scope.cropMode = false;
        }
      });
    };

    $scope.$watchCollection('image.selections', function (newCollection, oldCollection) {
      var uncomputedCrops = [];
      for (var ratio in newCollection) {
        if (newCollection[ratio].source !== 'user') {
          uncomputedCrops.push(ratio);
        }
      }

      $scope.uncomputedCrops = uncomputedCrops;

      if ($scope.uncomputedCrops.length > 1) {
        $scope.finished = false;
      } else {
        $scope.finished = true;
      }

    });

    $scope.isCurrentCropOrDone = function (ratio) {
      var classes = {};

      if ($scope.currentCrop === ratio) {
        classes['bg-info'] = true;
      }

      if ($scope.image.selections[ratio].source === 'user') {
        classes['fa-check bootstrap-green'] = true;
      } else {
        classes['fa-circle-thin'] = true;
      }

      return classes;
    };

    $scope.isCropDone = function (ratio) {
      var classes = {};

      if ($scope.image.selections[ratio].source === 'user') {
        classes['fa-check bootstrap-green'] = true;
      }

      return classes;
    };

    $scope.onInit = function () {
      BettyCropper.detail($scope.img_ref.id)
        .success(function (data) {
          $scope.image = data;
          if (cropsToEdit) {
            $scope.image.selections = {'16x9': $scope.image.selections['16x9']};
          }
          $scope.setThumbStyles($scope.image, $scope.image.selections);
          $scope.ratioOrder = Object.keys($scope.image.selections);

          $scope.crop_image_style = $scope.computeImageTagStyle(
            angular.element('#crop-image img')[0],
            $scope.crop_image
          );

          var cropper = angular.element('.image-cropper-modal');
          cropper.focus(); // for capturing key events
          cropper.on('keyup', function (e) {
            if (e.which === 13) {
              if ($scope.cropMode) {
                if ($scope.uncomputedCrops.length) {
                  $scope.saveAndNext();
                } else {
                  $scope.saveAndQuit();
                }
              } else if ($scope.finished) {
                $modalInstance.close();
              }
            }
          });

        });
    };

    $scope.onInit();

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('LoginmodalCtrl', function ($scope, Login, $modalInstance, $) {
    $scope.login = function () {
      var username = $('input[name=\'username\']').val();
      var password = $('input[name=\'password\']').val();
      Login.login(username, password).then(
        function () { $modalInstance.close(); },
        function () { $modalInstance.dismiss(); }
      );
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('UnpublishCtrl', function ($scope, $http, $q) {

    $scope.unpubButton = {
      idle: 'Unpublish',
      busy: 'Unpublishing',
      finished: 'Unpublished!',
      error: 'Error'
    };


    $scope.unpublish = function () {
      return $http({
        url: '/cms/api/v1/content/' + $scope.article.id + '/publish/',
        method: 'POST',
        data: {published: false}
      });
    };

    $scope.unpublishCbk = function (unpub_promise) {
      unpub_promise
        .then(function (result) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: result.data});
          }
        })
        .catch(function (reason) {
          if ($scope.publishSuccessCbk) {
            $scope.publishSuccessCbk({article: $scope.article, response: reason.data});
          }
        });
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('activeNav', function ($location) {
    return {
      template: '<li><a href="{{href}}">{{label}}</a></li>',
      restrict: 'E',
      scope: {},
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.href = attrs.href;
        scope.label = attrs.label;
        if ($location.path().indexOf(scope.href) === 0) {
          element.addClass('active');
        }
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function (routes, LOADING_IMG_SRC) {
    return {
      restrict: 'E',
      templateUrl:  routes.PARTIALS_URL + 'promotion-tool-article-container.html',
      scope: {
        'article': '='
      },
      link: function postLink(scope, element, attrs) {
        scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
        scope.ratio = attrs.ratio;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('bulbsAutocomplete', function ($http, $location, $compile, $timeout, $, Login, Raven) {

    var autocomplete_dropdown_template = '<div class="autocomplete dropdown" ng-show="autocomplete_list">\
          <div class="entry" ng-repeat="option in autocomplete_list" ng-click="onClick(option)">\
              {{display(option);}}\
          </div>\
      </div>';

    return {
      restrict: 'AC',
      link: function postLink(scope, element, attrs) {
        var $elem = $(element).find('input');
        $elem.attr('autocomplete', 'off');
        var dropdown = $($compile(autocomplete_dropdown_template)(scope));

        $(dropdown).css({
          position: 'absolute',
          top: $elem.position().top + $elem.outerHeight(),
          left: $elem.position().left,
          minWidth: $elem.outerWidth(),
          display: 'none'
        });
        $elem.parent().append(dropdown);
        $(dropdown).fadeIn('fast');

        // Observe the element's dimensions.
        scope.$watch(
          function () {
            return {
              top: $elem.position().top + $elem.outerHeight(),
              left: $elem.position().left,
              minWidth: $elem.outerWidth()
            };
          },
          function (newValue, oldValue) {
            $(dropdown).css({
              top: newValue.top,
              left: newValue.left,
              minWidth: newValue.minWidth
            });
          },
          true
        );

        var inputCounter = 0, inputTimeout;

        $elem.on('focus', function (e) {
          $elem.on('input', function () {
            var val = $elem.val();
            if (val === '') {
              scope.autocomplete_list = [];
            } else {
              $timeout.cancel(inputTimeout);
              inputTimeout = $timeout(function () { getAutocompletes(val); }, 200);

              if (inputCounter > 2) {
                getAutocompletes(val);
              }
            }
          });
          $(dropdown).fadeIn('fast');
        });

        function getAutocompletes(val) {
          $timeout.cancel(inputTimeout);
          inputCounter = 0;
          $http({
            method: 'GET',
            url: scope.resourceUrl + val
          }).success(function (data) {
            var results = data.results || data;
            scope.autocomplete_list = results.splice(0, 5);
          }).error(function (data, status, headers, config) {
            Raven.captureMessage('Error in getAutocompletes', {extra: data});
          });
        }

        $elem.on('blur', function (e) {
          $(dropdown).fadeOut('fast');
        });

        $(dropdown).on('mouseover', '.entry', function (e) {
          $(dropdown).find('.selected').removeClass('selected');
          $(this).addClass('selected');
        });

        $elem.on('keyup', function (e) {
          if (e.keyCode === 40) { //down
            if ($('div.selected', dropdown).length === 0) {
              $('div.entry', dropdown).first().addClass('selected');
            } else {
              var curDownSelect = $('div.selected', dropdown);
              var curDownSelectNext = curDownSelect.next('div');
              if (curDownSelectNext.length === 0) {
                $('div.entry', dropdown).first().addClass('selected');
              } else {
                curDownSelectNext.addClass('selected');
              }
              curDownSelect.removeClass('selected');
            }
          }
          if (e.keyCode === 38) { //up
            if ($('div.selected', dropdown).length === 0) {
              $('div.entry', dropdown).last().addClass('selected');
            } else {
              var curSelect = $('div.selected', dropdown);
              var curSelectNext = curSelect.prev('div');
              if (curSelectNext.length === 0) {
                $('div.entry', dropdown).last().addClass('selected');
              } else {
                curSelectNext.addClass('selected');
              }
              curSelect.removeClass('selected');
            }
          }
          if (e.keyCode === 13) {
            var selected = $('div.selected', dropdown);
            if (selected.length === 0) { scope.onClick($elem.val(), true); }
            selected.click();
          }
        });

        scope.onClick = function (o, freeForm) {
          scope.add(o, $elem, freeForm || false);
          scope.autocomplete_list = [];
          //if (!scope.$$phase) scope.$apply();
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('bugReporter', function ($http, $window, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bug-report-button.html',
      scope: {},
      controller: function ($scope, $element, $timeout) {
        $scope.report = {};
        $scope.reportButton = {
          idle: 'Submit',
          busy: 'Sending',
          finished: 'Sent!',
          error: 'Error!'
        };

        $scope.modalVisible = false;
        $scope.showThankYou = false;

        $scope.showModal = function () {
          $scope.modalVisible = true;
        };

        $scope.dismissModal = function () {
          $scope.modalVisible = false;
          $scope.showThankYou = false;
        };

        $scope.sendToWebtech = function () {
          var report =
            'When I tried to:\n\n' + $scope.report.firstRes + '\n\n' +
            'I thought this would happen:\n\n' + $scope.report.secondRes + '\n\n' +
            '...but this happened instead:\n\n' + $scope.report.thirdRes
          ;
          var data = {
            report: report,
            url: $window.location.href,
            user_agent: $window.navigator.userAgent
          };
          return $http.post('/cms/api/v1/report-bug/', data);
        };

        $scope.sendToWebtechCbk = function (promise) {
          promise
            .then(function () {
              $scope.showThankYou = true;
              $timeout(function () {
                $scope.dismissModal();
                for (var entry in $scope.report) {
                  $scope.report[entry] = '';
                }
              }, 5000);
            });
        };

        /*
          Exposing this globally for PNotify.
          Will revisit when we review how to
          report bugs on the CMS.
        */
        $window.showBugReportModal = function () {
          $scope.$apply($scope.showModal());
        };

      },
      link: function (scope, element) {

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('bettyeditable', function ($http, routes, BettyCropper, openImageCropModal, DEFAULT_IMAGE_WIDTH) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bettyeditable.html',
      scope: {
        'image': '=',
        'addStyles': '@',
        'placeholderText': '@',
        'hideMetas': '=',
        'ratio': '@'
      },
      controller: function ($scope, $element) {

        $scope.imageData = null;

        function uploadSuccess(response) {
          if (!$scope.image) {
            $scope.image = {
              id: null,
              caption: null,
              alt: null
            };
          }
          $scope.image.id = response.id;
          $scope.imageData = response;
          $scope.showImage();
          $scope.editImage();
        }

        $scope.upload = function (e) {
          BettyCropper.upload().then(
            function (success) {
              uploadSuccess(success);
            },
            function (error) {
              console.log(error);
            },
            function (progress) {
              console.log(progress);
            }
          );
        };
      },
      link: function (scope, element, attrs) {


        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);

        scope.showImage = function () {
          if (scope.imageData === null) {
            scope.getImageData();
            return;
          }
          scope.imageStyling = scope.computeImageStyle(
            scope.imageData,
            scope.imageData.selections[scope.ratio]
          );

        };

        scope.computeImageStyle = function (image, selection) {
          var scale, styles,
          el_height = (image.height / image.width) * $(element).parent().width(),
          s_width = selection.x1 - selection.x0,
          s_height = selection.y1 - selection.y0,
          tmp_selection = selection;

          if (!s_width || !s_height) {
            /*
                If we have bogus selections, make
                the crop equal to the whole image
            */
            s_width = $(element).parent().width();
            s_height = el_height;
            tmp_selection = {
              'x0': 0,
              'y0': 0,
              'x1': s_width,
              'y1': s_height
            };
          }

          styles = {};
          scale = $(element).parent().width() / s_width;
          styles['background'] = 'url(' + BettyCropper.origJpg(scope.image.id, DEFAULT_IMAGE_WIDTH) + ')';
          styles['background-size'] = scope.scaleNumber(image.width, scale) + 'px';
          styles['background-position'] = '' +
            '-' + scope.scaleNumber(tmp_selection.x0, scale) + 'px ' +
            '-' + scope.scaleNumber(tmp_selection.y0, scale) + 'px';
          styles['background-repeat'] = 'no-repeat';
          styles['height'] = scope.scaleNumber(s_height, scale) + 'px';
          styles['width'] = scope.scaleNumber(s_width, scale) + 'px';
          styles['position'] = 'relative';

          return styles;
        };

        scope.scaleNumber = function (num, by_scale) {
          return Math.floor(num * by_scale);
        };

        scope.getImageData = function () {
          BettyCropper.detail(
            scope.image.id
          ).success(function (response) {
            scope.imageData = response;
            scope.showImage();
          }).error(function (data, status, headers, config) {
            if (status === 404) {
              var el_Height = (ratioHeight / ratioWidth) * $(element).parent().width();
              scope.imageStyling = {
                'background': 'url(' + BettyCropper.url(
                  scope.image.id, scope.ratio, DEFAULT_IMAGE_WIDTH, 'jpg'
                ) + ')',
                'background-size': $(element).parent().width(),
                'height': Math.floor(el_Height) + 'px',
                'position': 'relative'
              };
            }
          });
        };

        scope.removeImage = function () {
          scope.image.id = null;
        };

        scope.editImage = function () {
          var editRatios;
          if (attrs.editRatios) {
            editRatios = eval(attrs.editRatios);
          } else {
            editRatios = false;
          }
          openImageCropModal(scope.image, editRatios)
          .then(function (image) {
            if (image.id === null) {
              scope.image = null;
            } else {
              scope.image = image;
              scope.getImageData();
            }
          });
        };

        if (scope.image && scope.image.id) {
          scope.showImage();
        }

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('bettyimage', function ($http, routes) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'bettyimage.html',
      scope: {
        'image': '=',
        'ratio': '=',
        'width': '@'
      },
      controller: function ($scope) {
      },
      link: function (scope, element, attrs) {
        scope.width = parseInt(scope.width, 10);
        var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
        var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);
        var height = (scope.width * ratioHeight / ratioWidth) + 'px';

        element.css('width', scope.width + 'px');
        element.css('height', height);

        var selection = scope.image.selections[scope.ratio];
        var selectionWidth = (selection.x1 - selection.x0);
        var scale = scope.width / selectionWidth;

        var requestWidth = Math.round((scale * (scope.image.width - selectionWidth)) + scope.width);
        element.css('background-image', 'url(' + routes.IMAGE_SERVER_URL + '/' + scope.image.id + '/original/' + requestWidth + '.jpg)');
        element.css('background-position', (scale * selection.x0 * -1) + 'px ' + (scale * selection.y0 * -1) + 'px');
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('createContent', function ($http, $window, $, IfExistsElse, Login, ContentApi, routes, AUTO_ADD_AUTHOR, Raven) {
    return {
      restrict: 'E',
      templateUrl:  routes.DIRECTIVE_PARTIALS_URL + 'create-content.html',
      controller: function ($scope) {
        $scope.gotTags = false;
        $scope.gotUser = false;
        $scope.gotSave = false;
        $scope.$watch(function () {
          return $scope.gotTags && $scope.gotUser && $scope.gotSave;
        }, function (val) {
          if (val) {
            saveArticle($scope.init);
          }
        });

        $scope.newArticle = function () {
          var init = {'title': $scope.newTitle};
          angular.extend($scope.init, init);

          if ($scope.tag) {
            IfExistsElse.ifExistsElse(
              ContentApi.all('tag').getList({
                ordering: 'name',
                search: $scope.tag
              }),
              {slug: $scope.tag},
              function (tag) { $scope.init.tags = [tag]; $scope.gotTags = true; },
              function (value) { console.log('couldnt find tag ' + value.slug + ' for initial value'); },
              function (data, status, headers, config) { Raven.captureMessage('Error Creating Article', {extra: data}); }
            );
          } else {
            $scope.gotTags = true;
          }

          if (AUTO_ADD_AUTHOR) {
            ContentApi.one('me').get().then(function (data) {
              $scope.init.authors = [data];
              $scope.gotUser = true;
            });
          } else {
            $scope.gotUser = true;
          }

          $scope.gotSave = true;
        };

        function saveArticle() {
          $('button.go').removeClass('btn-danger').addClass('btn-success').html('<i class="fa fa-refresh fa-spin"></i> Going');
          $http({
            url: '/cms/api/v1/content/?doctype=' + $scope.contentType,
            method: 'POST',
            data: $scope.init
          }).success(function (resp) {
            var new_id = resp.id;
            var new_path = '/cms/app/edit/' + new_id + '/';
            if ($scope.rating_type) {
              new_path += '?rating_type=' + $scope.rating_type;
            }
            $window.location.href = $window.location.origin + new_path;
          }).error(function (data, status, headers, config) {
            if (status === 403) {
              $('button.go')
                .html('<i class="glyphicon glyphicon-exclamation-sign"></i> Please Log In');
            } else {
              $('button.go').removeClass('btn-success').addClass('btn-danger').html('<i class="glyphicon glyphicon-remove"></i> Error');
            }
            $scope.gotSave = false;
          });
        }


      },
      link: function (scope, element, attrs) {
        //HEY THIS SUCKS
        //TODO: This sucks!
        scope.panel = 1;

        $(element).find('a.create-content').on('click', function (e) {
          $('a.create-content.active').removeClass('active');
          $(this).addClass('active');
        });

        $(element).find('a.create-content').on('click', function (e) {
          scope.contentTypeLabel = $(this).text();
          scope.contentType = $(this).data('content_type') || null;
          scope.init = $(this).data('init') || {};
          scope.tag = $(this).data('tag') || null;
          scope.rating_type = $(this).data('rating_type') || null;
          scope.$apply();

          if ($(this).hasClass('go-next')) {
            $('#create button.next-pane').click();
          }

          return true;
        });

        $('button.next-pane:not(.hide)').on('click', function (e) {
          scope.panel = 2;
          $('.new-title').focus();
        });

        $(element).on('keydown', '.editor', function (e) {
          if (e.keyCode === 13 && scope.newTitle) {
            $(element).find('.go').click();
          }
        });

        $('#create').on('hidden.bs.modal', function () {
          scope.newTitle = '';
          scope.panel = 1;
        });

      }

    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('devicepreview', function ($, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'devicepreview.html',
      link: function (scope, element, attrs) {

        var pP = $('#page-prev'),
            tN = pP.find('.nav a'),
            cO = pP.find('.tab-content .active');

        tN.click(function (e) {
          var newId = $(this).attr('href').split('#')[1];
          e.preventDefault();
          cO.attr('id', newId);
        });

        $('#page-prev').on('show.bs.collapse', function () {
          $(this).find('.fa').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
        });

        $('#page-prev').on('hide.bs.collapse', function () {
          $(this).find('.fa').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('filterwidget', function ($http, $location, $window, $timeout, $, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'filterwidget.html',
      link: function (scope, element, attrs) {
        var $element = $(element);
        var $input = $element.find('input');

        scope.autocompleteArray = [];

        var filterInputCounter = 0, filterInputTimeout;

        $input.on('input', function (e) {
          var search = $input.val();
          scope.searchTerm = search;

          $timeout.cancel(filterInputTimeout);
          filterInputTimeout = $timeout(function () { getAutocompletes(search); }, 200);

          if (filterInputCounter > 2) {
            getAutocompletes(search);
          }
        });
        function getAutocompletes(search) {
          $timeout.cancel(filterInputTimeout);
          filterInputCounter = 0;
          if (search.length < 1) {
            scope.autocompleteArray = [];
            scope.$apply();
            return;
          }

          $http({
            url: '/cms/api/v1/things/?type=tag&type=feature_type&type=author',
            method: 'GET',
            params: {'q': search}
          }).success(function (data) {
            scope.autocompleteArray = data;
          });
        }

        $input.on('keyup', function (e) {
          if (e.keyCode === 38) { arrowSelect('up'); }//up
          if (e.keyCode === 40) { arrowSelect('down'); } //down
          if (e.keyCode === 13) { //enter
            if ($element.find('.selected').length > 0) { $element.find('.selected').click(); }
            else {
              scope.addFilter('search', $input.val());
            }
          }
        });

        $element.find('.search-button').on('click', function (e) {
          scope.addFilter('search', $input.val());
        });

        $element.find('.clear-button').on('click', function (e) {
          $(this).prev('input').val('');
          scope.filterObjects = {};
          applyFilterChange({});
        });

        $element.on('mouseover', '.entry', function () {
          scope.selectEntry(this);
        });

        function arrowSelect(direction) {
          var $entries = $element.find('.entry');
          var $selected = $element.find('.entry.selected');
          var $toSelect;
          if ($selected.length > 0) {
            if (direction === 'up') { $toSelect = $selected.first().prev(); }
            if (direction === 'down') { $toSelect = $selected.first().next(); }
          } else {
            if (direction === 'up') { $toSelect = $entries.last(); }
            if (direction === 'down') { $toSelect = $entries.first(); }
          }
          scope.selectEntry($toSelect);
        }
        scope.selectEntry = function (entry) {
          $element.find('.selected').removeClass('selected');
          $(entry).addClass('selected');
        };

        $input.on('blur', function () {
          $element.find('.dropdown-menu').fadeOut(200);
        });
        $input.on('focus', function () {
          $element.find('.dropdown-menu').fadeIn(200);
        });

        scope.addFilter = function (type, newFilterValue) {
          var filterObject = $location.search();
          if (type === 'search') {
            filterObject.search = newFilterValue;
          } else {
            if (!filterObject[type]) { filterObject[type] = []; }
            if (typeof(filterObject[type]) === 'string') { filterObject[type] = [filterObject[type]]; }
            filterObject[type].push(newFilterValue);
            $input.val('');
          }
          applyFilterChange(filterObject);
          scope.filterInputValue = '';
        };

        scope.deleteFilter = function (key) {
          var filterObject = $location.search();
          var toDelete = scope.filterObjects[key];
          if (typeof(filterObject[toDelete.type]) === 'string') { filterObject[type] = [filterObject[type]]; }
          var toSplice;
          for (var i in filterObject[toDelete.type]) {
            if (filterObject[toDelete.type][i] === toDelete.query) {
              toSplice = i;
              break;
            }
          }
          filterObject[toDelete.type].splice(i, 1);
          filterObject.search = $input.val();
          delete scope.filterObjects[key];
          applyFilterChange(filterObject);
        };

        function applyFilterChange(filterObject) {
          filterObject.page = 1;
          $location.search(filterObject);
          scope.getContent(filterObject);
          scope.autocompleteArray = [];
          $input.trigger('blur');
        }

        function getFilterObjects() {
          var search = $location.search();
          scope.filterObjects = {};
          if (typeof(search) === 'undefined') { console.log('undefined'); return; }
          //TODO: this sucks
          var filterParamsToTypes = {'authors': 'author', 'tags': 'tag', 'feature_types': 'feature_type'};
          for (var filterParam in filterParamsToTypes) {
            var filterType = filterParamsToTypes[filterParam];
            if (typeof(search[filterParam]) === 'string') { search[filterParam] = [search[filterParam]]; }
            for (var i in search[filterParam]) {
              var value = search[filterParam][i];
              scope.filterObjects[filterType + value] = {'query': value, 'type': filterParam};
              getQueryToLabelMappings(filterType, value);
            }
          }
          if (search.search) { scope.filterInputValue = search.search; }
        }

        scope.$on('$routeUpdate', function () {
          getFilterObjects();
        });

        getFilterObjects();

        function getQueryToLabelMappings(type, query) {
          //this is pretty stupid
          //TODO: Maybe do this with some localStorage caching?
          //TODO: Maybe just dont do this at all? I dont know if thats possible
          //    because there is no guarantee of any state (like if a user comes
          //    directly to a filtered search page via URL)
          scope.queryToLabelMappings = scope.queryToLabelMappings || {};

          if (query in scope.queryToLabelMappings) { return; }

          $http({
            url: '/cms/api/v1/things/?type=' + type,
            method: 'GET',
            params: {'q': query}
          }).success(function (data) {
            for (var i in data) {
              scope.queryToLabelMappings[data[i].value] = data[i].name;
            }
          });

        }

      }

    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('listinput', function ($, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'listinput.html',
      scope: {
        'model': '='
      },
      link: function (scope, element, attrs) {
        scope.label = attrs.label;
        scope.noun = attrs.noun;
        element.find('input')[0].setAttribute('name', attrs.noun);
        element.find('input').bind('focus', function (e) {
          $(element).find('.preview').hide();
          $(element).find('.all-container').show();
        });
        element.find('input').bind('blur', function (e) {
          $(element).find('.all-container').hide();
          $(element).find('.preview').show();
        });
        element.find('input').bind('keyup', function (e) {
          if (e.keyCode === 13) {
            var value = $(this).val();
            if (value.length > 0) {
              if (!scope.model) {
                scope.model = [];
              }
              scope.model.push($(this).val());
              scope.$apply();
              $(this).val('');
            }

          }
        });
      }

    };
  });

'use strict';

angular.module('bulbsCmsApp').directive(
  'videoUpload',
  function ($http, $window, $timeout, $sce, $, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'mainvideo.html',
      scope: {
        'article': '='
      },
      restrict: 'E',
      link: function (scope, element, attrs) {
        console.log('video upload here');
        console.log(scope.video_id);
        scope.$watch('article.video', function () {
          if (scope.article.video) {
            scope.embedUrl = $sce.trustAsUrl('/video/embed?id=' + scope.article.video);
            $http({
              method: 'GET',
              url: '/videos/api/video/' + scope.article.video + '/'
            }).success(function (data) {
              console.log('getting video from API');
              console.log(data);
              scope.video = data;
              $window.initVideoWidget(data.id);
            });
          }
        });

        scope.$watch('video', function () {

        });

        var progressEl = element.find('div.progress');
        var progressBar = element.find('div.progress-bar');
        var progressText = element.find('div.progress span');
        var fakeInput = element.find('input.fake-input');
        scope.lastProgress = 0;

        scope.addVideo = function () {
          console.log('chooseFile');
          $window.uploadVideo(element.find('.video-container')[0], {
            onSuccess: function (videoid) {
              scope.$apply(function () {
                console.log('addVideo onSuccess callback');
                console.log(videoid);
                scope.article.video = videoid;
              });
            },
            onError: function (data) {
              console.log('addVideo onError callback');
              console.log(data);
            },
            onProgress: function (data) {
              console.log('addVideo onProgress callback');
              console.log(data);
            }
          });
        };

        scope.clearVideo = function (areYouSure) {
          if (areYouSure) {
            $('#s3upload-file-input').val('');
            scope.article.video = null;
          } else {
            $('#confirm-clear-video-modal').modal('show');
          }
        };

        function abortUpload() {
          setProgress(0);
          if (scope.req) {
            scope.req.abort();
          }
          scope.video = {};
          setProgress(0);
        }

        function abortEncode() {
          $.ajax('https://app.zencoder.com/api/v2/jobs/' + scope.video.job_id + '/cancel.json?api_key=' + $window.videoAttrs.zencoderApiKey, {
            type: 'PUT',
            success: function (data) {
              scope.video.status = 3;
              fakeInput.val('Encoding failed! Please try again.');
            }
          });
        }

        scope.abort = function () {
          if (scope.encoding) {
            abortEncode();
            return;
          } else {
            abortUpload();
            return;
          }
        };

        function setProgress(progress) {
          if (progress === 0 || progress === 100) {
            progressEl.hide();
            return;
          }
          if (scope.lastProgress === 0 || Math.abs(progress - scope.lastProgress) > 2) {
            progressBar.css('width', Math.floor(progress) + '%');
            scope.lastProgress = progress;
            progressEl.show();
          }
        }

        function setProgressText(text) {
          progressText.html(text);
        }

        function updateEncodeProgress() {
          progressBar.addClass('progress-bar-success');

          delete $http.defaults.headers.common['X-Requested-With'];
          $http({
            url: 'https://app.zencoder.com/api/v2/jobs/' + scope.video.job_id + '/progress.json',
            method: 'GET',
            params: {
              api_key: $window.videoAttrs.zencoderApiKey
            },
            useXDomain: true
          }).success(function (data) {
            if (data.state === 'waiting' || data.state === 'pending' || data.state === 'processing') {
              scope.video.status = 2;
              if (data.progress > 5) {
                setProgress(data.progress);
                $timeout(updateEncodeProgress, 500);
              } else {
                $timeout(updateEncodeProgress, 2000);
              }
            } else {
              setProgress(0);
              if (data.state === 'finished') {
                scope.video.status = 1;
              }
              if (data.state === 'failed' || data.state === 'cancelled') {
                scope.video.status = 3;
                fakeInput.val('Encoding failed! Please try again.');
              }
            }
          }).error(function (data) {
            $('.alert-danger').fadeIn().delay(1000).fadeOut();
          });
        }

        var initialCheckRan = false;
        scope.$watch('video', function () {
          if (scope.video && scope.video.job_id && !initialCheckRan) {
            updateEncodeProgress();
            initialCheckRan = true;
          }
        });


      }


    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('loggedInUser', function (routes, CurrentUser) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: routes.PARTIALS_URL + 'logged-in-user.html',
      scope: {},
      link: function (scope, element, attrs) {
        scope.current_user = CurrentUser;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('mediaRating', function ($http, $, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'rating.html',
      scope: true,
      controller: function ($scope) {
        $scope.search = function (el) {
          $scope.searchTimeout = null;
          var inputs = el.find('.media-field input');
          var searchParams = {};
          for (var i = 0;i < inputs.length;i++) {
            if ($(inputs[i]).val() !== '') {
              searchParams[$(inputs[i]).attr('name')] = $(inputs[i]).val();
            }
          }
          $http({
            method: 'GET',
            url: '/reviews/api/v1/' + $scope.article.ratings[$scope.index].type + '/search',
            params: searchParams
          }).success(function (data) {
            $scope.searchResults = [];
            for (var key in data) {
              for (var index in data[key]) {
                $scope.searchResults.push(data[key][index]);
              }
            }
          });
        };

        $scope.mediaItemTemplate = function () {
          return $scope.MEDIA_ITEM_PARTIALS_URL + $scope.article.ratings[$scope.index].type.toLowerCase() + '.html' + $scope.CACHEBUSTER;
        };
        $scope.tvShowDisplay = function (x) {
          return x.name;
        };
        $scope.tvShowCallback = function (x, input, freeForm) {
          if (freeForm) {
            $scope.article.ratings[$scope.index].media_item.show = $(input).val();
          } else {
            $scope.article.ratings[$scope.index].media_item.show = x.name;
          }
        };
        $scope.tvShowRemove = function (x) {
          $scope.article.ratings[$scope.index].media_item.show = null;
        };
      },
      link: function (scope, element, attrs) {
        var $element = $(element);
        scope.index = attrs.index;
        scope.searchResults = [];

        $element.on('keypress', 'input.letter', function (e) {
          var chars = {
            65: 'A',
            66: 'B',
            67: 'C',
            68: 'D',
            70: 'F',
            97: 'A',
            98: 'B',
            99: 'C',
            100: 'D',
            102: 'F'
          };
          var mods = {
            45: '-',
            95: '_',
            43: '+',
            61: '+'
          };
          if (e.charCode in chars || e.charCode in mods) {
            var val = $(this).val();
            var oldChar = val.match(/[ABCDF]/);
            oldChar = oldChar ? oldChar[0] : '';
            var oldMod = val.match(/[+-]/);
            oldMod = oldMod ? oldMod[0] : '';
            var newVal;
            if (e.charCode in chars) {
              newVal = chars[e.charCode] + oldMod;
            }
            if (e.charCode in mods) {
              newVal = oldChar + mods[e.charCode];
            }
            $(this).val(newVal);
            $(this).trigger('input');
          }
          return false;

        });
        scope.searchTimeout = null;
        // $element.on('keydown', '.media-field input', function (e) {
        //     if (scope.searchTimeout !== null) {
        //         window.clearTimeout(scope.searchTimeout);
        //     }
        //     scope.searchTimeout = window.setTimeout(function () {
        //         scope.search($element);
        //     }, 250);
        // });

        $element.on('keyup', 'input[name="show"]', function (e) {
          var val = $element.find('input[name="show"]').val();
          $http({
            method: 'GET',
            url: '/reviews/api/v1/tvshow/?format=json',
            params: {'q': val}
          }).success(function (data) {
            scope.shows = data.results;
          });
        });

      }

    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('nav', function (routes, navbar_options) {
    return {
      restrict: 'E',
      templateUrl: function (tElement, tAttrs) {
        var getCustomTemplate = navbar_options[tAttrs.view];

        if (getCustomTemplate) {
          return routes.DIRECTIVE_PARTIALS_URL + navbar_options[tAttrs.view] + '.html';
        } else {
          return routes.PARTIALS_URL + tAttrs.view + '.html';
        }

      },
      scope: false,
      link: function (scope, element, attrs) {
        scope.NAV_LOGO = routes.NAV_LOGO;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('responsiveImage', function ($window, $) {
    return {
      link: function (scope, element, attrs) {
        attrs.$observe('imageId', function (val) {
          $(element).find('img').remove();
          element.attr('data-image-id', attrs.imageId);
          element.attr('data-crop', attrs.crop);
          if (!attrs.imageId || !$(element).is(':visible')) {
            return;
          }
          $window.pictureFillElement(element[0]);
          element.show();
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('saveButton', function ($q, $timeout, $window, NProgress, routes) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'save-button.html',
      scope: {
        'getPromise': '&',
        'saveCbk': '&onSave',
        'config': '=?',
        'colors': '@?colorStyling'
      },
      link: function (scope, element, attrs) {
        scope.colors_tmp = scope.colors;

        attrs.$observe('config', function (val) {
          if (!angular.isDefined(val)) {
            scope.config = {
              idle: '<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save',
              busy: 'Saving',
              finished: 'Saved',
              error: 'Error'
            };
          }
        });

        NProgress.configure({
          minimum: 0.4
        });

        scope.save = function () {
          if (attrs.confirmClickWith) {
            var message = attrs.confirmClickWith;
            if (!$window.confirm(message)) { return; }
          }

          NProgress.start();
          scope.colors = scope.colors_tmp;
          element
            .prop('disabled', true)
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var save_promise = scope.getPromise();

          var promise = save_promise
          .then(
            function (result) {
              NProgress.done();
              scope.colors = scope.colors_tmp;
              element
                .prop('disabled', false)
                .html('<i class=\'glyphicon glyphicon-ok\'></i> ' + scope.config.finished);

              return $timeout(function () {
                element.html(scope.config.idle);
              }, 1000)
              .then(function () {
                return result;
              });
            })
          .catch(
            function (reason) {
              NProgress.done();
              scope.colors = 'btn-danger';
              element
                .prop('disabled', false)
                .html('<i class=\'glyphicon glyphicon-remove\'></i> ' + scope.config.error);

              return $q.reject(reason);
            });
          if (scope.saveCbk) {
            scope.saveCbk({promise: promise});
          }
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('slideshowPane', function ($http, $window, $compile, $, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'slideshow-pane.html',
      scope: {
        article: '=',
        image: '=',
        index: '='
      },
      link: function (scope, element, attrs) {
        var $element = $(element);

        if (attrs.caption === 'false') { scope.hideCaption = true; }
        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';

        scope.removeImage = function (index) {
          scope.article.slides.splice(index, 1);
        },
        scope.editImage = function (index) {
          $window.openImageDrawer(
            scope.article.slides[index].id,
            function (data) {
              function removeLoadingGif() {
                $element.find('.image img[src=\"' + routes.LOADING_IMG_SRC + '\"]').remove();
              }

              removeLoadingGif();

              if ($element.find('.image').data('imageId') === data.id) {
                return;
              }

              $element.find('.image img').on('load', removeLoadingGif);
              $element.find('.image img').after('<img src=\"' + routes.LOADING_IMG_SRC + '\">');

              scope.article.slides[index].id = data.id.toString();
              scope.$apply();
              $window.picturefill();
              if ($element.find('.image img')[0].complete) { removeLoadingGif(); }
            },
            function () { return; },
            function (oldImage) {
              scope.article.slides[index] = oldImage;
              $window.picturefill();
            }
          );
        };

      }

    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('targeting', function (routes) {
    return {
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'targeting.html',
      link: function (scope, element, attrs) {
        scope.addTargetingRow = function (index) {
          scope.targetingArray.push([]);
        };
        scope.removeTargetingRow = function (index) {
          scope.targetingArray.splice(index, 1);
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('onionEditor', function (routes, $, Zencoder, BettyCropper, openImageCropModal, VIDEO_EMBED_URL) {
    return {
      require: 'ngModel',
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'editor.html',
      scope: {ngModel: '='},
      link: function (scope, element, attrs, ngModel) {

        if (!ngModel) {
          return;
        }

        var formatting;
        if (attrs.formatting) {
          formatting = attrs.formatting.split(',');
        }

        var options = {};

        if (attrs.role === 'multiline') {
          options = {
            // global options
            multiline: true,
            formatting: formatting || ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'strike'],
            placeholder: {
              text: attrs.placeholder ||  '<p>Write here</p>',
              container: $('.editorPlaceholder', element[0])[0],
            },
            link: {
              domain: attrs.linkDomain || false,
              // Sean, you can figure out a nicer way to handle the search handler.
              searchHandler: window[attrs.linkSearchHandler] || false
            },
            statsContainer: '.wordcount',
            inlineObjects: attrs.inlineObjects,
            image: {
              insertDialog: BettyCropper.upload,
              editDialog: openImageCropModal,
            },
            video: {
              insertDialog: Zencoder.onVideoFileUpload,
              editDialog: function () {},
              videoEmbedUrl: VIDEO_EMBED_URL
            }
          };
        }
        else {
          $('.document-tools, .embed-tools', element).hide();
          var defaultValue = '';
          options = {
            // global options
            multiline: false,
            placeholder: {
              text: attrs.placeholder || 'Write here',
              container: $('.editorPlaceholder', element[0])[0],
            },
            formatting: formatting || []
          };
        }

        var editor = new OnionEditor($('.editor', element[0])[0], options);

        ngModel.$render = function () {
          editor.setContent(ngModel.$viewValue || defaultValue);
          // register on change here, after the initial load so angular doesn't get mad...
          setTimeout(function () {
            editor.setChangeHandler(read);
          });
        };
        

        // Write data to the model
        function read() {
          scope.$apply(function () {
            var html = editor.getContent();
            ngModel.$setViewValue(html);
          });
        }

        scope.$watch(ngModel, function () {
          editor.setContent(ngModel.$viewValue || defaultValue);
          if (window.picturefill) {
            window.picturefill(element[0]);
          }
        });
      }
    };
  });
'use strict';

angular.module('bulbsCmsApp')
  .filter('truncateByCharacters', function () {
    return function (input, chars, breakOnWord) {
      if (isNaN(chars)) { return input; }
      if (chars <= 0) { return ''; }
      if (input && input.length >= chars) {
        input = input.substring(0, chars);
        if (!breakOnWord) {
          var lastspace = input.lastIndexOf(' ');
          //get last space
          if (lastspace !== -1) {
            input = input.substr(0, lastspace);
          }
        } else {
          while (input.charAt(input.length - 1) === ' ') {
            input = input.substr(0, input.length - 1);
          }
        }
        if (chars === 1) {
          return input + '.';
        } else {
          return input + '...';
        }
      }
      return input;
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .filter('truncateByWords', function () {
    return function (input, words) {
      if (isNaN(words)) { return input; }
      if (words <= 0) { return ''; }
      if (input) {
        var inputWords = input.split(/\s+/);
        if (inputWords.length > words) {
          input = inputWords.slice(0, words).join(' ') + '...';
        }
      }
      return input;
    };
  });

'use strict';

angular.module('BettyCropper', [])
  .service('BettyCropper', function BettyCropper($http, $interpolate, $q, IMAGE_SERVER_URL, BC_API_KEY) {
    var fileInputId = '#bulbs-cms-hidden-image-file-input';
    var inputTemplate = '<input id="bulbs-cms-hidden-image-file-input" type="file" accept="image/*" style="position: absolute; left:-99999px;" name="image" />';

    this.upload = function () {
      var uploadImageDeferred = $q.defer();

      angular.element(fileInputId).remove();
      var fileInput = angular.element(inputTemplate);
      angular.element('body').append(fileInput);
      fileInput.click();
      fileInput.unbind('change');

      fileInput.bind('change', function (elem) {
        if (this.files.length !== 1) {
          uploadImageDeferred.reject('We need exactly one image!');
        }
        var file = this.files[0];
        if (file.type.indexOf('image/') !== 0) {
          uploadImageDeferred.reject('Not an image!');
        }

        if (file.size > 10 * 1024 * 1024) { // MAGIC!
          uploadImageDeferred.reject('The file is too large!');
        }

        newImage(file).success(function (success) {
          uploadImageDeferred.resolve(success);
        }).error(function (error) {
          uploadImageDeferred.reject(error);
        });

      });

      return uploadImageDeferred.promise;
    };

    this.detail = function (id) {
      return $http({
        method: 'GET',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        transformRequest: angular.identity
      });
    };

    this.detailPatch = function (id, name, credit, selections) {
      return $http({
        method: 'PATCH',
        url: IMAGE_SERVER_URL + '/api/' + id,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: {
          name: name,
          credit: credit,
          selections: selections
        },
        transformRequest: angular.identity
      });
    };

    function newImage(image, name, credit) {
      var imageData = new FormData();
      imageData.append('image', image);
      if (name) { imageData.append('name', name); }
      if (credit) { imageData.append('credit', credit); }

      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/new',
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: imageData,
        transformRequest: angular.identity
      });
    }

    this.updateSelection = function (id, ratio, selections) {
      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/' + id + '/' + ratio,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: selections
      });
    };

    this.url = function (id, crop, width, format) {
      var exp = $interpolate(
        '{{ url }}/{{ id }}/{{ crop }}/{{ width }}.{{ format }}'
      );
      return exp({
        url: IMAGE_SERVER_URL,
        id: id,
        crop: crop,
        width: width,
        format: format
      });
    };

    this.origJpg = function (id, width) {
      return this.url(id, 'original', width, 'jpg');
    };

    this.origGif = function (id, width) {
      return this.url(id, 'original', width, 'gif');
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .service('IfExistsElse', function IfExistsElse($window, $http) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.ifExistsElse = function (restQ, propertiesToValues, existsCbk, elseCbk, errorCbk) {
      //another place where I need to figure out promises and make this way better
      restQ.then(function (data) {
        var resList = data.results || data;
        for (var j = 0; j < resList.length; j++) {
          var allFieldsMatch = true;
          var datum = resList[j];
          for (var property in propertiesToValues) {
            if (!datum.hasOwnProperty(property)) {
              allFieldsMatch = false;
              break;
            }
            //console.log("property: " + property)
            if (datum[property] !== propertiesToValues[property]) {
              //console.log(resList[j][property] + " != " + propertiesToValues[property])
              allFieldsMatch = false;
              break;
            }
          }
          if (allFieldsMatch) {
            existsCbk(datum);
            return;
          }
        }
        elseCbk(propertiesToValues);
      }).catch(errorCbk);
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .factory('openImageCropModal', function ($modal, routes) {
    var openImageCropModal = function (image, cropsToEdit) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'image-crop-modal.html',
        controller: 'ImageCropModalCtrl',
        resolve: {
          img_ref: function () { return image; },
          cropsToEdit: function () { return cropsToEdit || false; }
        },
        backdrop: 'static'
      }).result;

    };

    return openImageCropModal;
  });

'use strict';

angular.module('bulbsCmsApp')
  .config(function (RestangularProvider, bulbsApiConfig) {
    // This is specific to Django Rest Framework      
    RestangularProvider.setResponseExtractor(function (response, operation, what, url) {
      var newResponse = response;
      if (operation === 'getList') {
        if (typeof response.results !== 'undefined') {
          newResponse = response.results;
          newResponse.metadata = {
            count: response.count,
            next: response.next,
            previous: response.previous
          };
        }
      }
      return newResponse;
    });
    if (bulbsApiConfig.requestSuffix) {
      RestangularProvider.setRequestSuffix(bulbsApiConfig.requestSuffix);
    }
  })
  .constant('bulbsApiConfig', {
    requestSuffix: '/'
  });
'use strict';

angular.module('bulbsCmsApp')
  .service('CurrentUser', function EditorItems(ContentApi) {
    this.data = [];
    var self = this;

    this.getItems = function () {
      ContentApi.one('me').get().then(function (data) {
        self.data = data;
      });
    };

    this.getItems();
  });

'use strict';

angular.module('bulbsCmsApp')
  .factory('ContentApi', function (Restangular, contentApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(contentApiConfig.baseUrl);
    });
  })
  .constant('contentApiConfig', {
    baseUrl: '/cms/api/v1'
  });

'use strict';

angular.module('bulbsCmsApp')
  .factory('ReviewApi', function (Restangular, reviewApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(reviewApiConfig.baseUrl);
    });
  })
  .constant('reviewApiConfig', {
    baseUrl: '/reviews/api/v1',
  });

'use strict';

angular.module('bulbsCmsApp')
  .factory('PromotionApi', function (Restangular, promotionApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(promotionApiConfig.baseUrl);
    });
  })
  .constant('promotionApiConfig', {
    baseUrl: '/promotions/api'
  });

'use strict';

angular.module('bulbsCmsApp')
  .factory('AdApi', function (Restangular, adApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(adApiConfig.baseUrl);
    });
  })
  .constant('adApiConfig', {
    baseUrl: '/ads'
  });

'use strict';

angular.module('bulbsCmsApp')
  .service('Login', function Login($rootScope, $http, $cookies, $window, $, routes) {

    $rootScope.$watch(function () {
      return $cookies.csrftoken;
    }, function (newCsrf, oldCsrf) {
      $http.defaults.headers.common['X-CSRFToken'] = newCsrf;
      if ($window.jqueryCsrfSetup) {
        $window.jqueryCsrfSetup();
      }
    });

    return {
      login: function (username, password) {
        var data = $.param({username: username, password: password});
        return $http({
          method: 'POST',
          url: '/login/',
          data: data,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
      }
    };
  });
'use strict';

angular.module('bulbsCmsApp')
  .filter('tzDate', function (dateFilter, moment, TIMEZONE_OFFSET, TIMEZONE_LABEL) {
    return function (input, format) {
      if (!input) {
        return '';
      }
      var newdate = moment(input).zone(TIMEZONE_OFFSET).format('YYYY-MM-DDTHH:mm');
      var formattedDate = dateFilter(newdate, format);
      if (format.toLowerCase().indexOf('h') > -1) {
        formattedDate += ' ' + TIMEZONE_LABEL;
      }
      return formattedDate;
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ChangelogmodalCtrl', function ($scope, $modalInstance, _, ContentApi, article) {
    $scope.article = article;
    $scope.users = {};

    ContentApi.all('log').getList({content: article.id}).then(function (data) {
      $scope.changelog = data;

      var userIds = _.unique(_.pluck(data, 'user'));
      for (var i in userIds) {
        ContentApi.one('author', userIds[i]).get().then(function (data) {
          $scope.users[data.id] = data;
        });
      }
    });

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('VersionbrowsermodalCtrl', function ($scope, $window, $modalInstance, _, moment, Localstoragebackup, article) {
    Localstoragebackup.backupToLocalStorage();

    var keys = _.keys($window.localStorage);
    var timestamps = [];
    for (var i in keys) {
      if (keys[i] && (keys[i].split('.')[0] !== Localstoragebackup.keyPrefix || keys[i].split('.')[2] !== article.id)) {
        continue;
      }
      var timestamp = Number(keys[i].split('.')[1]) * 1000;
      timestamps.push(timestamp);
    }
    $scope.timestamps = timestamps.sort().reverse();

    $scope.preview = function (timestamp, $event) {
      //manipulating dom in a controller is gross! bad!
      $('.version-timestamp-list .active').removeClass('active');
      $($event.target).parent().addClass('active');

      var key = Localstoragebackup.keyPrefix + '.' + timestamp / 1000 + '.' + article.id + '.body';
      var html = $window.localStorage.getItem(key);
      $scope.versionPreview = html;
    };

    $scope.restoreSelected = function () {
      $scope.article.body = $scope.versionPreview;
      $modalInstance.close();
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .service('Localstoragebackup', function Localstoragebackup($routeParams, $window, moment, $, _) {

    /*
    hacky first version of local storage backup
    this is for backing up body contents to local storage
    for now this is just keying to articleBodyBackup.<timestamp>.<article id>.body
    if LS is full, it tries deleting old backups
    TODO: add tests
    TODO: make configurable
    TODO: apply to other fields
    TODO: don't use $().html() to capture the value
    TODO: capture routeChange and cancel the interval
      (this works for now because we're doing a full teardown on route change
      if we ever go back to a real 'single page app' this will fuck up)
    TODO: lots of stuff
    */

    this.keyPrefix = 'articleBodyBackup';
    this.keySuffix = '.' + $routeParams.id + '.body';

    var keyPrefix = this.keyPrefix;
    var keySuffix = this.keySuffix;

    this.backupToLocalStorage = function () {
      var localStorageKeys = Object.keys($window.localStorage);
      var mostRecentTimestamp = 0;
      for (var keyIndex in localStorageKeys) {
        var key = $window.localStorage.key(keyIndex);
        if (key && key.split('.')[2] === $routeParams.id && Number(key.split('.')[1]) > mostRecentTimestamp) {
          mostRecentTimestamp = Number(key.split('.')[1]);
        }
      }
      var mostRecentValue = $window.localStorage.getItem(keyPrefix + '.' + mostRecentTimestamp + keySuffix);
      if (mostRecentValue === $('#content-body .editor').html()) {
        return;
      }
      if ($window.localStorage) {
        try {
          $window.localStorage.setItem(keyPrefix + '.' + moment().unix() + keySuffix, $('#content-body .editor').html()); //TODO: this is gonna break
        } catch (error) {
          console.log('Caught localStorage Error ' + error);
          console.log('Trying to prune old entries');

          for (var keyIndex in localStorageKeys) {
            var key = $window.localStorage.key(keyIndex);
            if (!key || key && key.split('.')[0] !== keyPrefix) {
              continue;
            }
            var yesterday = moment().date(moment().date() - 1).unix();
            var keyStamp = Number(key.split('.')[1]);
            if (keyStamp < yesterday) {
              $window.localStorage.removeItem(key);
            }
          }
        }
      }
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $route, $modalInstance, ContentApi, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    ContentApi.all('log').getList({content: article.id}).then(function (log) {
      var latest = _.max(log, function (entry) { return moment(entry.action_time); });
      var lastSavedById = latest.user;
      ContentApi.one('author', lastSavedById).get().then(function (data) {
        $scope.lastSavedBy = data;
      });
    });

    $scope.loadFromServer = function () {
      $route.reload();
      $modalInstance.close();
    };

    $scope.saveAnyway = function () {
      $modalInstance.close();
      $scope.$parent.postValidationSaveArticle();
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .filter('user', function () {
    return function (user) {
      if (!user) { return ''; }
      if (user.full_name) {
        return user.full_name;
      } else if (user.first_name && user.last_name) {
        return user.first_name + ' ' + user.last_name;
      } else {
        return user.username;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .provider('StatusFilterOptions', function () {
    var _statuses = [
      {label: 'Draft', key: 'status', value: 'draft'},
      {label: 'Published', key: 'before', value: function () { return moment().format('YYYY-MM-DDTHH:mmZ'); }},
      {label: 'Scheduled', key: 'after', value: function () { return moment().format('YYYY-MM-DDTHH:mmZ'); }},
      {label: 'All', key: null, value: null}
    ];

    this.setStatuses = function (statuses) {
      _statuses = statuses;
    };

    this.$get = function () {
      return {
        getStatuses: function () {
          return _statuses;
        }
      };
    };

  })
  .directive('statusFilter', function ($location, _, StatusFilterOptions, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'status-filter.html',
      restrict: 'E',
      replace: true,
      controller: 'ContentlistCtrl',
      link: function postLink(scope, element, attrs) {
        scope.options = StatusFilterOptions.getStatuses();

        scope.isActive = function (option) {
          if (option.key && option.key in $location.search() && $location.search()[option.key] === getValue(option)) {
            return true;
          }
          if (!option.key) { //all
            var possibleKeys = _.pluck(scope.options, 'key');
            var searchKeys = _.keys($location.search());
            if (_.intersection(possibleKeys, searchKeys).length > 0) {
              return false;
            } else {
              return true;
            }
          }
          return false;
        };

        scope.filterByStatus = function (option) {
          var search = {};
          var value;
          if (option.key) {
            value = getValue(option);
            search[option.key] = value;
          }
          scope.getContent(search);
        };

        function getValue(option) {
          var value;
          if (typeof option.value === 'function') {
            value = option.value();
          } else {
            value = option.value;
          }
          return value;
        }

      }
    };
  });
'use strict';

angular.module('bulbsCmsApp')
  .service('Zencoder', function Zencoder($http, $q, $modal, $, routes) {
    var newVideoUrl = '/video/new';
    var fileInputId = '#bulbs-cms-hidden-video-file-input';
    var inputTemplate = '<input id="bulbs-cms-hidden-video-file-input" type="file" accept="video/*" style="position: absolute; left:-99999px;" name="video" />';

    this.onVideoFileUpload = function () {
      var clickDeferred = $q.defer();

      angular.element(fileInputId).remove();
      var fileInput = angular.element(inputTemplate);
      var file;
      angular.element('body').append(fileInput);
      fileInput.click();
      fileInput.unbind('change');
      fileInput.bind('change', function (elem) {
        if (this.files.length !== 0) {
          file = this.files[0];

          // We have a file upload limit of 1024MB
          if (file.size > (1024 * 1024 * 1024)) {
            clickDeferred.reject('Upload file cannot be larger than 1024MB.');
          }

          if (file.type.indexOf('video/') !== 0) {
            clickDeferred.reject('You must upload a video file.');
          }
        } else {
          clickDeferred.reject('Please select a file.');
        }

        getNewVideoUploadCredentials(file)
          .then(uploadToS3)
          .then(encode, angular.noop, function (uploadPercentComplete) { clickDeferred.notify(uploadPercentComplete); })
          .then(
            function (videoObject) {
              clickDeferred.resolve(videoObject);
            },
            function (error) {
              clickDeferred.reject(error);
            }
          );

      });

      return clickDeferred.promise;
    };

    function getNewVideoUploadCredentials(file) {
      var data = {name: file.name};
      data = $.param(data);

      var newVideoDeferred = $q.defer();

      $http({
        method: 'POST',
        url: newVideoUrl,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function (data) {
        newVideoDeferred.resolve({
          file: file,
          attrs: data
        });
      }).error(function (data) {
        newVideoDeferred.reject(data);
      });

      return newVideoDeferred.promise;
    }

    function uploadToS3(videoObject) {
      var s3deferred = $q.defer();

      var formData = new FormData();

      formData.append('key', videoObject.attrs.key);
      formData.append('AWSAccessKeyId', videoObject.attrs.AWSAccessKeyId);
      formData.append('acl', videoObject.attrs.acl);
      formData.append('success_action_status', videoObject.attrs.success_action_status);
      formData.append('policy', videoObject.attrs.policy);
      formData.append('signature', videoObject.attrs.signature);
      formData.append('file', videoObject.file);

      //todo: use a vanilla XMLHttpRequest in heyea
      $.ajax(videoObject.attrs.upload_endpoint, {
        processData: false,
        contentType: false,
        data: formData,
        type: 'POST',
        xhr: function () {
          var req = $.ajaxSettings.xhr();
          if (req) {
            req.upload.addEventListener('progress', function (e) {
              var percent = (e.loaded / e.total) * 100;
              s3deferred.notify(percent);
            }, false);
          }
          return req;
        },
        success: function (data) {
          s3deferred.resolve(videoObject);
        },
        error: function (data) {
          s3deferred.reject(data);
        }
      });

      return s3deferred.promise;

    }

    function encode(videoObject) {
      var encodeDeferred = $q.defer();

      $http({
        method: 'POST',
        url: '/video/' + videoObject.attrs.id + '/encode'
      }).success(function (data) {
        videoObject.attrs['encode_status_endpoints'] = data;
        _encodingVideos[videoObject.attrs.id] = videoObject.attrs;

        encodeDeferred.resolve(videoObject);
      }).error(function (data) {
        encodeDeferred.reject(data);
      });

      return encodeDeferred.promise;
    }
    this.encode = function (videoId) {
      encode({attrs: {id: videoId}});
    };

    this.openVideoThumbnailModal = function (videoId, posterUrl) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/video-thumbnail-modal.html',
        controller: 'VideothumbnailmodalCtrl',
        resolve: {
          videoId: function () { return videoId; },
          posterUrl: function () { return posterUrl || null; }
        }
      });
    };

    this.getVideo = function (videoId) {
      var url = '/video/' + videoId;
      return $http({
        method: 'GET',
        url: url
      });
    };

    this.setVideo = function (video) {
      var url = '/video/' + video.id;
      var data = $.param(video);
      return $http({
        method: 'POST',
        url: url,
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    };

    var _encodingVideos = {};
    this.encodingVideos = _encodingVideos;

  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('authorsField', function (routes, userFilter) {
    return {
      templateUrl: routes.PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.name = 'author';
        scope.label = 'Authors';
        scope.placeholder = 'Authors';
        scope.resourceUrl = '/cms/api/v1/author/?ordering=name&search=';
        scope.display = userFilter;

        scope.$watch('article.authors', function () {
          scope.objects = scope.article.authors;
        }, true);

        scope.add = function (o, input) {
          for (var t in scope.article.authors) {
            if (scope.article.authors[t].id === o.id) { return; }
          }
          scope.article.authors.push(o);
          $(input).val('');
        };

        scope.delete = function (e) {
          var author = $(e.target).parents('[data-taglikeobject]').data('taglikeobject');
          var id = author.id;
          var newauthors = [];
          for (var i in scope.article.authors) {
            if (scope.article.authors[i].id !== id) {
              newauthors.push(scope.article.authors[i]);
            }
          }
          scope.article.authors = newauthors;
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('tagsField', function (routes, _, IfExistsElse, ContentApi, Raven) {
    return {
      templateUrl: routes.PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'tag';
        scope.label = 'Tags';
        scope.placeholder = 'Enter a tag';
        scope.resourceUrl = '/cms/api/v1/tag/?ordering=name&types=content_tag&search=';
        scope.display = function (o) {
          return o.name;
        };

        scope.$watch('article.tags', function () {
          scope.objects = _.where(article.tags, {type: 'content_tag'});
        }, true);

        scope.add = function (o, input, freeForm) {
          var tagVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentApi.all('tag').getList({
              ordering: 'name',
              search: tagVal
            }),
            {name: tagVal},
            function (tag) { scope.article.tags.push(tag); },
            function (value) { scope.article.tags.push({name: value.name, type: 'content_tag', new: true}); },
            function (data, status) { Raven.captureMessage('Error Adding Tag', {extra: data}); }
          );
          $(input).val('');
        };

        scope.delete = function (e) {
          var tag = $(e.target).parents('[data-taglikeobject]').data('taglikeobject');
          var name = tag.name;
          var newtags = [];
          for (var i in scope.article.tags) {
            if (scope.article.tags[i].name !== name) {
              newtags.push(scope.article.tags[i]);
            }
          }
          scope.article.tags = newtags;
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('featuretypeField', function (routes, IfExistsElse, ContentApi, Raven) {
    return {
      templateUrl: routes.PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'feature_type';
        scope.label = 'Feature Type';
        scope.placeholder = 'Feature Type';
        scope.resourceUrl = '/cms/api/v1/things/?type=feature_type&q=';

        scope.$watch('article.feature_type', function () {
          scope.model = scope.article.feature_type;
        });

        scope.display = function (o) {
          return (o && o.name) || '';
        };

        scope.add = function (o, input, freeForm) {
          var fVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentApi.all('things').getList({
              type: 'feature_type',
              q: fVal
            }),
            {name: fVal},
            function (ft) { scope.article.feature_type = ft.name; $('#feature-type-container').removeClass('newtag'); },
            function (value) { scope.article.feature_type = value.name; $('#feature-type-container').addClass('newtag'); },
            function (data, status) { Raven.captureMessage('Error Adding Feature Type', {extra: data}); }
          );
        };

        scope.delete = function (e) {
          article.feature_type = null;
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('sectionsField', function (routes, _, IfExistsElse, ContentApi, Raven) {
    return {
      templateUrl: routes.PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'section';
        scope.label = 'Sections';
        scope.placeholder = 'Enter a section';
        scope.resourceUrl = '/cms/api/v1/tag/?ordering=name&types=core_section&search=';
        scope.display = function (o) {
          return o.name;
        };

        scope.$watch('article.tags', function () {
          scope.objects = _.where(article.tags, {type: 'core_section'});
        }, true);

        scope.add = function (o, input, freeForm) {
          var tagVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentApi.all('tag').getList({
              ordering: 'name',
              search: tagVal
            }),
            {name: tagVal},
            function (tag) { scope.article.tags.push(tag); },
            function () { console.log('Can\'t create sections.'); },
            function (data, status) { Raven.captureMessage('Error Adding Section', {extra: data}); }
          );
          $(input).val('');
        };

        scope.delete = function (e) {
          var tag = $(e.target).parents('[data-taglikeobject]').data('taglikeobject');
          var name = tag.name;
          var newtags = [];
          for (var i in scope.article.tags) {
            if (scope.article.tags[i].name !== name) {
              newtags.push(scope.article.tags[i]);
            }
          }
          scope.article.tags = newtags;
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('videoEmbed', function (VIDEO_EMBED_URL) {
    return {
      template: '<div class="video-embed"><iframe src="{{videoUrl}}"></iframe></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.videoUrl = VIDEO_EMBED_URL + attrs.videoId;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('videoField', function (Zencoder, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'video-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.removeVideo = function () {
          scope.article.video = null;
        };

        scope.uploadVideo = function () {
          Zencoder.onVideoFileUpload().then(
            function (success) {
              console.log(success);
              scope.article.video = success.attrs.id;
            },
            angular.noop,
            function (progress) {
              console.log(progress);
              scope.uploadProgress = progress;
            }
          );
        };

        scope.thumbnailModal = function () {
          Zencoder.openVideoThumbnailModal(article.video).result.then(
            function (resolve) {
              console.log('thumbnail modal resolve');
              console.log(resolve);
              //article.poster_url = resolve;
            },
            function (reject) {
              console.log('thumbnail modal rejected');
            }
          );
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('SponsormodalCtrl', function ($scope, ContentApi, article) {
    $scope.article = article;

    ContentApi.all('sponsor').getList().then(function (data) {
      $scope.sponsors = data;
    });

    $scope.selectSponsor = function (sponsor) {
      $scope.article.sponsor = sponsor.id;
    };

    $scope.clearSponsor = function () {
      $scope.article.sponsor = null;
    };


  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('VideothumbnailmodalCtrl', function ($scope, $http, $modalInstance, Zencoder, videoId, posterUrl, VIDEO_THUMBNAIL_URL, STATIC_IMAGE_URL) {
    var DEFAULT_THUMBNAIL = 4;
    var MAX_THUMBNAIL = 19;
    $scope.uploadedImage = {id: null};
    $scope.mode = 'still';

    Zencoder.getVideo(videoId).then(
      function (response) {
        $scope.video = response.data;
        if (response.data.status === 'In Progress') {
          $scope.inProgress = true;
          $scope.video.poster = $scope.video.poster || null;
        } else {
          $scope.video.poster = $scope.video.poster || compilePosterUrl(DEFAULT_THUMBNAIL);
        }
      }
    );

    $scope.$watch('video.poster', function () {
      if (!$scope.video || !$scope.video.poster) { return; }
      var defaultUrl = VIDEO_THUMBNAIL_URL.replace('{{video}}', videoId);
      var thumbnailIndex = defaultUrl.indexOf('{{thumbnail}}');
      if ($scope.video.poster.indexOf(defaultUrl.substr(0, thumbnailIndex)) === 0) {
        $scope.currentThumbnail = Number($scope.video.poster.substr(thumbnailIndex, 4));
        $scope.uploadedImage.id = null;
      } else {
        $scope.currentThumbnail = false;
      }
    });

    $scope.$watch('uploadedImage.id', function () {
      if ($scope.uploadedImage.id) {
        $scope.video.poster = STATIC_IMAGE_URL.replace('{{image}}', $scope.uploadedImage.id);
      }
    });

    $scope.nextThumb = function () {
      $scope.video.poster = compilePosterUrl($scope.currentThumbnail < MAX_THUMBNAIL ? $scope.currentThumbnail + 1 : 0);
    };

    $scope.prevThumb = function () {
      $scope.video.poster = compilePosterUrl($scope.currentThumbnail > 0 ? $scope.currentThumbnail - 1 : MAX_THUMBNAIL);
    };

    $scope.defaultThumb = function () {
      $scope.video.poster = compilePosterUrl(DEFAULT_THUMBNAIL);
    };

    $scope.setPoster = function () {
      Zencoder.setVideo($scope.video);
      $modalInstance.close($scope.video.poster);
    };

    $scope.reencode = function () {
      Zencoder.encode(videoId);
    };

    function compilePosterUrl(thumbnail) {
      return VIDEO_THUMBNAIL_URL.replace('{{video}}', videoId).replace('{{thumbnail}}', pad4(thumbnail));
    }

    function pad4(num) {
      var s = '0000' + num;
      return s.substr(s.length - 4);
    }
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('encodeStatus', function ($http, $interval, $, Zencoder, routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'encode-status.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.encodingVideos = {};

        scope.$watch(function () {
          return Zencoder.encodingVideos;
        }, function () {
          updateEncodeStatuses();
        }, true);

        $interval(function () {
          $('iframe').filter(function () { return this.src.match(/\/video\/embed\/?/); }).each(function () {
            var idRegex = /\/video\/embed\/?\?id=(\d+)/;
            var id = idRegex.exec(this.src)[1];
            if (!(id in Zencoder.encodingVideos)) {
              Zencoder.getVideo(id).then(function (data) {
                Zencoder.encodingVideos[id] = data.data;
              });
            }
          });
          updateEncodeStatuses();
        }, 5000);

        function updateEncodeStatuses() {
          for (var i in Zencoder.encodingVideos) {
            if (scope.encodingVideos[i] && scope.encodingVideos[i].finished) {
              continue;
            }
            scope.encodingVideos[i] = Zencoder.encodingVideos[i];
            (function (videoid) {
              if (Zencoder.encodingVideos[videoid].encode_status_endpoints && Zencoder.encodingVideos[videoid].encode_status_endpoints.json) {
                $http({
                  method: 'GET',
                  url: Zencoder.encodingVideos[videoid].encode_status_endpoints.json,
                  headers: {
                    'X-CSRFToken': undefined
                  },
                }).success(function (data) {
                  scope.encodingVideos[videoid].job_status = data;
                  if (data.state === 'finished') {
                    scope.encodingVideos[videoid].finished = true;
                  }

                });
              }
            })(i);
          }
        }

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', function (routes, STATIC_IMAGE_URL) {
    return {
      templateUrl: routes.PARTIALS_URL + 'static-image.html',
      restrict: 'E',
      scope: {
        'image': '='
      },
      link: function postLink(scope, element, attrs) {
        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl = STATIC_IMAGE_URL.replace('{{image}}', scope.image.id);
          } else {
            scope.imageUrl = false;
          }
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('tvshowField', function (routes) {
    return {
      templateUrl: routes.PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'tvshow';
        scope.label = 'Show';
        scope.placeholder = 'The Simpsons';
        scope.resourceUrl = '/reviews/api/v1/tvshow/?q=';

        scope.$watch('article.ratings', function () {
          scope.model = scope.article.ratings[scope.index].media_item.show;
        }, true);

        scope.display = scope.tvShowDisplay;
        scope.add = scope.tvShowCallback;
        scope.delete = scope.tvShowRemove;

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ForbiddenmodalCtrl', function ($scope, detail) {
    $scope.detail = detail;
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('hideIfForbidden', function ($http) {
    function hideElement(element) {
      element.addClass('hidden');
    }

    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        $http({
          method: 'OPTIONS',
          url: attrs.optionsUrl,
          noPermissionIntercept: true
        }).success(function (data, status) {
          //I guess 403s aren't errors? I dont know.
          if (status === 403) {
            hideElement(element);
          }
        }).error(function (data, status) {
          if (status === 403) {
            hideElement(element);
          }
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp').factory('BugReportInterceptor', function ($q, $window, PNotify) {
    return {
      responseError: function (rejection) {
        if (rejection.status >= 500) {
          var stack = {
            animation: true,
            dir1: 'up',
            dir2: 'left'
          };
          new PNotify({
            title: 'You found a bug!',
            text:
              'Looks like something just went wrong, and we need your help to fix it! Report it, and we\'ll make sure it never happens again.',
            type: 'error',
            confirm: {
              confirm: true,
              align: 'left',
              buttons: [{
                text: 'Report Bug',
                addClass: 'btn-danger pnotify-report-bug',
                click: function (notice) {
                  notice.remove();
                  $window.showBugReportModal(); // see bugreporter.js
                }
              }, {addClass: 'hidden'}] // removing the "Cancel" button
            },
            buttons: {
              sticker: false
            },
            icon: 'fa fa-bug pnotify-error-icon',
            addclass: 'stack-bottomright',
            stack: stack
          });
        }
        return $q.reject(rejection);
      }
    };
  });
'use strict';
  /* helpful SO question on injecting $modal into interceptor and doing intercept pass-through
    http://stackoverflow.com/questions/14681654/i-need-two-instances-of-angularjs-http-service-or-what
  */
angular.module('bulbsCmsApp').factory('PermissionsInterceptor', function ($q, $injector, routes) {
  return {
    responseError: function (rejection) {
      if (rejection.config.noPermissionIntercept) {
        return $q.when(rejection);
      } else {
        $injector.invoke(function ($modal) {
          if (rejection.status === 403) {
            if (rejection.data && rejection.data.detail && rejection.data.detail.indexOf('credentials') > 0) {
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/login-modal.html',
                controller: 'LoginmodalCtrl'
              });
            } else {
              var detail = rejection.data && rejection.data.detail || 'Forbidden';
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/403-modal.html',
                controller: 'ForbiddenmodalCtrl',
                resolve: {
                  detail: function () { return detail; }
                }
              });
            }
          }
        });
        return $q.reject(rejection);
      }
    }
  };
});