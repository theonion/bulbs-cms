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
  'Raven',
  'firebase'
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
      reloadOnSearch: false
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
  $httpProvider.interceptors.push('BadRequestInterceptor');

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
    $window, $q, $, ContentApi,
    LOADING_IMG_SRC, routes)
  {
    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = routes.CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;
    $scope.collapse = {};

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

    $scope.getContent();

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
      
    $('body').on('shown.bs.collapse', '.panel-collapse', function(e){
      $scope.$digest();
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
    IfExistsElse, Localstoragebackup, ContentApi, FirebaseApi, Login, routes)
  {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.CONTENT_PARTIALS_URL = routes.CONTENT_PARTIALS_URL;
    $scope.MEDIA_ITEM_PARTIALS_URL = routes.MEDIA_ITEM_PARTIALS_URL;

    /*note on cachebuster:
      contentedit ng-includes templates served by django
      which are currently treated like templates
      instead of static assets (which they are)
      we're cachebuster those URLs because we've run into trouble 
      with cached version in the past and it was a bludgeon solution
        kill this someday! --SB
    */
    $scope.CACHEBUSTER = routes.CACHEBUSTER;

    var getArticleCallback = function (data) {
      $window.article = $scope.article = data; //exposing article on window for debugging

      $scope.last_saved_article = angular.copy(data);

      // log in to firebase
      FirebaseApi.login();

      // register the current user as viewing this article
      FirebaseApi.registerCurrentUserActive($scope.article.id);

      // sync this article variable with the currently active users
      FirebaseApi.getActiveUsers($scope.article.id, function (activeUsers) {

//        $scope.activeUsers = activeUsers.$asArray();
        var $activeUsers = activeUsers.$asArray();
        $activeUsers.$watch(function () {

          // do some unionizng on activeUsers data when it changes
          $scope.activeUsers =
            _.chain($activeUsers)
              .groupBy(function (user) { return user.id; })
              .map(function (group) {
                var groupedUser = group[0];
                groupedUser.count = group.length;
                return groupedUser;
              })
              .sortBy(function (user) { return user.displayName; })
              .value();

        });

      });

    };

    function getContent() {
      return ContentApi.one('content', $routeParams.id).get().then(getArticleCallback);
    }
    getContent();

    $scope.$watch('article.title', function () {
      $window.document.title = routes.CMS_NAMESPACE + ' | Editing ' + ($scope.article && $('<span>' + $scope.article.title + '</span>').text());
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
      saveToContentApi();
      return $scope.saveArticleDeferred.promise;
    };

    var saveHTML =  '<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save';
    var navbarSave = '.navbar-save';


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
        $window.onbeforeunload = function() {};
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
          articleId: function () {}
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

    $scope.thumbnailModal = function () {
      // open thumbnail modal along with its controller
      var modalInst = $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/thumbnail-modal.html',
        controller: 'ThumbnailModalCtrl',
        scope: $scope
      });
      // if user chooses a thumbnail, set that to the article's thumbnail override (user wants their own thumbnail)
      modalInst.result.then(function (chosenThumbnail) {
        $scope.article.thumbnail_override = chosenThumbnail;
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

    $scope.descriptionModal = function (article) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/description-modal.html',
        controller: 'DescriptionModalCtrl',
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
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance) {

    // keep track of if there is an override or not
    $scope.hasOverride = $scope.article.thumbnail_override
                            && 'id' in $scope.article.thumbnail_override
                            && $scope.article.thumbnail_override.id !== null;

    // decide what temporary thumbnail to display
    $scope.thumbnailTemp = {id: null};
    if ($scope.hasOverride) {
      $scope.thumbnailTemp.id = $scope.article.thumbnail_override.id;
    } else if ($scope.article.thumbnail && 'id' in $scope.article.thumbnail) {
      $scope.thumbnailTemp.id = $scope.article.thumbnail.id;
    }

    // keep track of if any changes to thumbnail have been made
    $scope.thumbnailChanged = false;

    /**
     * Upload a new image to BettyCropper and set the scope's thumbnailTemp to that new image.
     */
    $scope.selectCustomThumbnail = function () {

      // allow user to choose a custom thumbnail
      BettyCropper.upload().then(function (success) {

          $scope.thumbnailTemp = {
            id: success.id,
            caption: null,
            alt: null
          };

          $scope.thumbnailChanged = true;

        }, function (error) {
          console.log(error);
        }, function (progress) {
          console.log(progress);
        }
      );

    };

    /**
     * Close the modal with whatever thumbnail data has been chosen. External controller must capture this data and
     *  decide what to do with it. Modal will close with null if no new thumbnail has been chosen.
     */
    $scope.chooseThumbnail = function () {

      // when thumbnail is chosen, close modal with thumbnail data
      if ($scope.thumbnailTemp && $scope.thumbnailTemp.id !== null
          && (!$scope.article.thumbnail || ($scope.thumbnailTemp.id !== $scope.article.thumbnail.id))) {
        // here user has chosen a new override, close it with actual thumbnail data
        $modalInstance.close($scope.thumbnailTemp);
      } else {
        // here user has not chosen any new thumbnail data, or has cleared out the thumbnail, close it with no data
        $modalInstance.close(null);
      }

    };

  });

'use strict';

angular.module('bulbsCmsApp')
    .controller('DescriptionModalCtrl', function ($scope, $modalInstance, article) {

        $scope.article = article;

    });

'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $, Login, articleId, Raven) {
    $scope.deleteButton = {
      idle: 'Delete',
      busy: 'Trashing',
      finished: 'Trashed',
      error: 'Error!'
    };

    $scope.trashContent = function () {
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
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance, BettyCropper, Selection, DEFAULT_IMAGE_WIDTH, imageData, ratios) {
    $scope.selectedCrop = null;
    $scope.cropMode = false;
    $scope.ratios = ratios;
    $scope.finished = false;
    $scope.thumb_container_styles = {};
    $scope.imageData = imageData;

    if (!$scope.image) {
      $scope.image = null;
      BettyCropper.get(imageData.id).then(function(success){
        $scope.image = success.data;
      });
    }

    $scope.$watch('image', function (image) {
      if (!image) {
        return;
      }

      var finished = true;
      for (var ratio in image.selections) {
        if (image.selections[ratio].source === 'auto') {
          finished = false;
          break;
        }
      }
      $scope.finished = finished;

      $scope.scaleData = image.scaleToFit(550, 400);

      $('.crop-image-container img').one('load', function () {
        $(this).Jcrop({
          allowSelect: false,
          allowMove: true,
          allowResize: true,
          keySupport: false
        }, function () {
          $scope.jcrop_api = this;
        });
      });

      $scope.image_url = image.url('original', DEFAULT_IMAGE_WIDTH, 'jpg');
      if (!$scope.ratios) {
        $scope.ratios = Object.keys(image.selections);
      }

      $scope.setThumbStyles();
    });

    $scope.$watch('selectedCrop', function(crop) {
      if (!$scope.image) {
        return;
      }
      var finished = true;
      for (var ratio in $scope.image.selections) {
        if ($scope.image.selections[ratio].source === 'auto' && ratio !== crop) {
          finished = false;
          break;
        }
      }
      $scope.finished = finished;
    });

    $scope.selectCrop = function (ratio) {
      if (!ratio) {
        ratio = Object.keys($scope.image.selections)[0];
        for (var key in $scope.image.selections) {
          if ($scope.image.selections[key].source === 'auto') {
            ratio = key;
            break;
          }
        }
      }
      var selection = $scope.image.selections[ratio].scaleBy($scope.scaleData.scale);

      $scope.jcrop_api.setOptions({
        aspectRatio: selection.width() / selection.height()
      });

      $scope.jcrop_api.setSelect([
        selection.x0,
        selection.y0,
        selection.x1,
        selection.y1
      ]);

      $scope.cropMode = true;
      $scope.selectedCrop = ratio;
    };

    $scope.setThumbStyles = function () {
      $scope.thumb_styles = $scope.thumb_styles || {};

      for (var ratio in $scope.image.selections) {
        var scaledSelection = $scope.image.selections[ratio].scaleToFit(170, 170);
        $scope.thumb_container_styles[ratio] = {
          'padding-top': Math.round((180 - scaledSelection.height()) / 2) + 'px',
          'padding-bottom': '5px',
          'padding-left':  Math.round((180 - scaledSelection.width()) / 2) + 'px',
          'padding-right': '5px'
        };

        $scope.thumb_styles[ratio] = $scope.image.getStyles(170, 170, ratio);
      }
    };

    $scope.save = function (ratio) {

      var jcrop_selection = $scope.jcrop_api.tellSelect();

      var newSelection = new Selection({
        x0: jcrop_selection.x,
        x1: jcrop_selection.x2,
        y0: jcrop_selection.y,
        y1: jcrop_selection.y2,
        source: 'user'
      });
      newSelection = newSelection.scaleBy(1 / $scope.scaleData.scale);
      if (newSelection.x1 > $scope.image.width) {
        newSelection.x1 = $scope.image.width;
      }
      if (newSelection.y1 > $scope.image.height) {
        newSelection.y1 = $scope.image.height;
      }

      return this.image.updateSelection(ratio, newSelection);
    };

    $scope.saveAndQuit = function () {
      var ratio = $scope.selectedCrop;
      this.save(ratio).then(function (success) {
        var ratio = success.data[0];
        var selection = success.data[1];
        $scope.image.selections[ratio] = selection;
      });
      $scope.cropMode = false;
      $modalInstance.close(imageData);
    };

    $scope.saveAndNext = function () {
      var ratio = $scope.selectedCrop;
      this.save(ratio).then(function (success) {
        var ratio = success.data[0];
        var selection = success.data[1];
        $scope.image.selections[ratio] = selection;

        var nextRatioIndex = ($scope.ratios.indexOf(ratio) + 1) % $scope.ratios.length; 

        $scope.selectCrop($scope.ratios[nextRatioIndex]);
      });
    };

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
        'ratio': '@',
        'editable': '=?'
      },
      controller: function ($scope, $element) {
        $scope.editable = angular.isDefined($scope.editable) ? $scope.editable : true;
        $scope.upload = function (e) {
          BettyCropper.upload().then(
            function (success) {
              $scope.image = {
                id: success.id,
                caption: null,
                alt: null
              };
              $scope.bettyImage = success;
            },
            function (error) {
              console.log(error);
            },
            function (progress) {
              console.log(progress);
            }
          );
        };

        $scope.edit = function (e) {
          openImageCropModal($scope.image).then(function (image) {
            if (image.id === null) {
              $scope.image = null;
            } else {
              $scope.image = image;
              BettyCropper.get($scope.image.id).then(function(response){
                $scope.bettyImage = response.data;
                $scope.setStyles();
              });
            }
          });
        };
      },

      link: function (scope, element, attrs) {

        if (scope.bettyImage === undefined) {
          scope.bettyImage = null;
        }

        scope.setStyles = function () {
          if (scope.bettyImage) {
            scope.imageStyling = scope.bettyImage.getStyles(element.parent().width(), element.parent().height(), scope.ratio);
          } else {
            var ratioWidth = parseInt(scope.ratio.split('x')[0], 10);
            var ratioHeight = parseInt(scope.ratio.split('x')[1], 10);
            scope.imageStyling = {
              'background-color': '#333',
              'position': 'relative',
              'width': element.parent().width(),
              'height': Math.floor(element.parent().width() * ratioHeight / ratioWidth) + 'px',
            };
          }
        };

        scope.$watch('bettyImage', function (oldValue, newValue) {
          scope.setStyles();
        }, true);

        element.resize(scope.setStyles);

        scope.removeImage = function () {
          scope.image.id = null;
        };

        scope.editImage = function () {
          openImageCropModal(scope.image)
          .then(function (success) {
            console.log(success);
          });
        };

        if (!scope.bettyImage && scope.image && scope.image.id) {
          BettyCropper.get(scope.image.id).then(function(response){
            scope.bettyImage = response.data;
          });
        }
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
        var defaultValue = '';

        if (attrs.role === 'multiline') {
          defaultValue = '<p><br></p>';
          options = {
            // global options
            multiline: true,
            formatting: formatting || ['link', 'bold', 'italic', 'blockquote', 'heading', 'list', 'strike', 'underline'],
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
              editDialog: Zencoder.openVideoThumbnailModal,
              videoEmbedUrl: VIDEO_EMBED_URL
            }
          };
        }
        else {
          $('.document-tools, .embed-tools', element).hide();
          defaultValue = '';
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
          var val = ngModel.$viewValue || defaultValue;
          editor.setContent(ngModel.$viewValue || defaultValue);
          // register on change here, after the initial load so angular doesn't get mad...
          setTimeout(function () {
            editor.setChangeHandler(read);
          });
        };
        
        // Redefine what empty looks like
        ngModel.$isEmpty = function (value) {
          return ! value || editor.scribe.allowsBlockElements() && value === defaultValue;
        };

        // Write data to the model
        function read() {
          safeApply(scope, function () {
            var html = editor.getContent();
            if (html === defaultValue) {
              html = '';
            }
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

function safeApply(scope, fn) {
  if (scope.$$phase || scope.$root.$$phase) {
    fn();
  } else {
    scope.$apply(function () {
      fn();
    });
  }
}

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
(function () {
  angular.module('BettyCropper', ['restangular'])
    .value('DEFAULT_IMAGE_WIDTH', 1200)
    .factory('Selection', SelectionFactory)
    .factory('BettyImage', BettyImageFactory)
    .service('BettyCropper', BettyCropperService);

  function BettyCropperService($http, $interpolate, $q, IMAGE_SERVER_URL, BC_API_KEY, BettyImage) {
      var fileInputId = '#bulbs-cms-hidden-image-file-input';
      var inputTemplate = '<input id="bulbs-cms-hidden-image-file-input" type="file" accept="image/*" style="position: absolute; left:-99999px;" name="image" />';

      this.upload = upload;
      this.get = get;
      this.detail = get;
      this.detailPatch = detailPatch;
      this.updateSelection = updateSelection;

      function upload() {
        var uploadImageDeferred = $q.defer();

        angular.element(fileInputId).remove();
        var fileInput = angular.element(inputTemplate);
        angular.element('body').append(fileInput);
        
        fileInput.click();

        fileInput.unbind('change');
        fileInput.bind('change', function (e) {
          if (e.target.files.length !== 1) {
            uploadImageDeferred.reject('We need exactly one image!');
          }
          var file = e.target.files[0];
          if (file.type.indexOf('image/') !== 0) {
            uploadImageDeferred.reject('Not an image!');
          }

          if (file.size > 10 * 1024 * 1024) { // MAGIC!
            uploadImageDeferred.reject('The file is too large!');
          }

          var imageData = new FormData();
          imageData.append('image', file);

          $http({
            method: 'POST',
            url: IMAGE_SERVER_URL + '/api/new',
            headers: {
              'X-Betty-Api-Key': BC_API_KEY,
              'Content-Type': undefined,
              'X-CSRFToken': undefined
            },
            data: imageData,
            transformRequest: angular.identity,
            transformResponse: function (data, headersGetter) {
              // So, sometimes the browser doesn't think that JSON data is JSON.
              if (typeof data === 'string') {
                data = $.parseJSON(data);
              }
              var image = new BettyImage(data);
              return image;
            }
          }).success(function (success) {
            uploadImageDeferred.resolve(success);
          }).error(function (error) {
            uploadImageDeferred.reject(error);
          });

        });

        return uploadImageDeferred.promise;
      }

      function get(id) {
        return $http({
          method: 'GET',
          url: IMAGE_SERVER_URL + '/api/' + id,
          headers: {
            'X-Betty-Api-Key': BC_API_KEY,
            'Content-Type': undefined,
            'X-CSRFToken': undefined
          },
          transformRequest: angular.identity,
          transformResponse: function (data, headersGetter) {
            if (typeof data === 'string') {
              data = $.parseJSON(data);
            }
            return new BettyImage(data);
          }
        });
      }

      function detailPatch(id, name, credit, selections) {
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
          transformRequest: angular.identity,
          transformResponse: function (data, headersGetter) {
            if (typeof data === 'string') {
              data = $.parseJSON(data);
            }
            return new BettyImage(data);
          }
        });
      }

      function updateSelection(id, ratio, selections) {
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
      }
  }

  function BettyImageFactory($interpolate, $http, IMAGE_SERVER_URL, BC_API_KEY, DEFAULT_IMAGE_WIDTH, Selection) {
    function BettyImage(data) {
      this.id = data.id;
      this.name = data.name;
      this.width = data.width;
      this.height = data.height;
      this.selections = {};
      for (var ratio in data.selections) {
        this.selections[ratio] = new Selection(data.selections[ratio]);
      }
    }

    BettyImage.prototype.scaleToFit = function(width, height) {
      var scale;
      if (width && height) {
        var fitRatio = width / height;
        var thisRatio = this.width / this.height;
        if (fitRatio > thisRatio) {
          scale = height/ this.height;
        } else {
          scale = width / this.width;
        }
      } else {
        if (width) {
          scale = width / this.width;
        }
        if (height) {
          scale = height/ this.height;
        }
      }
      var scaled = {
        width: Math.round(this.width * scale),
        height: Math.round(this.height * scale),
        scale: scale
      };
      return scaled;
    };

    BettyImage.prototype.getStyles = function(width, height, ratio) {
      if (height === 0) {
        height = null;
      }

      var selection = this.selections[ratio];
      var scaledSelection = selection.scaleToFit(width, height);

      return {
        'background-image': 'url(' + this.url('original', DEFAULT_IMAGE_WIDTH, 'jpg') + ')',
        'background-size': Math.floor(scaledSelection.width() / selection.width()  * this.width) + 'px',
        'background-position': '-' + scaledSelection.x0 + 'px -' + scaledSelection.y0 + 'px',
        'height': scaledSelection.height() + 'px',
        'width': scaledSelection.width() + 'px',
        'background-repeat': 'no-repeat',
        'position': 'relative'
      };
    };

    BettyImage.prototype.url = function (ratio, width, format) {
      var exp = $interpolate(
        '{{ base_url }}/{{ id }}/{{ ratio }}/{{ width }}.{{ format }}'
      );
      var idStr = this.id.toString();
      var segmentedId = '';
      for (var i=0; i < idStr.length; i++) {
        if (i % 4 === 0 && i !== 0) {
          segmentedId += '/';
        }
        segmentedId += idStr.substr(i, 1);
      }
      return exp({
        base_url: IMAGE_SERVER_URL,
        id: segmentedId,
        ratio: ratio,
        width: width,
        format: format
      });
    };

    BettyImage.prototype.updateSelection = function (ratio, selection) {
      var data = {
        x0: selection.x0,
        x1: selection.x1,
        y0: selection.y0,
        y1: selection.y1
      };
      if (selection.source) {
        data.source = selection.source;
      }
      return $http({
        method: 'POST',
        url: IMAGE_SERVER_URL + '/api/' + this.id + '/' + ratio,
        headers: {
          'X-Betty-Api-Key': BC_API_KEY,
          'Content-Type': undefined,
          'X-CSRFToken': undefined
        },
        data: data,
        transformResponse: function (data, headersGetter) {
          if (typeof data === 'string') {
            data = $.parseJSON(data);
          }
          return [ratio, new Selection(data.selections[ratio])];
        }
      });
    };

    return BettyImage;
  }

  function SelectionFactory() {
    function Selection(data) {
        this.x0 = data.x0;
        this.x1 = data.x1;
        this.y0 = data.y0;
        this.y1 = data.y1;
        this.source = data.source;
    }

    Selection.prototype.width = function () {
      return this.x1 - this.x0;
    };

    Selection.prototype.height = function () {
      return this.y1 - this.y0;
    };

    Selection.prototype.scaleBy = function(scale) {
      var scaledToFit = new Selection({
        x0: Math.round(this.x0 * scale),
        x1: Math.round(this.x1 * scale),
        y0: Math.round(this.y0 * scale),
        y1: Math.round(this.y1 * scale)
      });
      return scaledToFit;
    };

    Selection.prototype.scaleToFit = function (width, height) {

      var scale;
      if (width && height) {
        var fitRatio = width / height;
        var thisRatio = this.width() / this.height();
        if (fitRatio > thisRatio) {
          scale = height/ this.height();
        } else {
          scale = width / this.width();
        }
      } else {
        if (width) {
          scale = width / this.width();
        }
        if (height) {
          scale = height/ this.height();
        }
      }
      return this.scaleBy(scale);
    };

    return Selection;
  }
})();
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
    var openImageCropModal = function (imageData, ratios) {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'image-crop-modal.html',
        controller: 'ImageCropModalCtrl',
        resolve: {
          imageData: function () { return imageData; },
          ratios: function () { return ratios || false; }
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
  .value('FIREBASE_URL', 'https://luminous-fire-8340.firebaseio.com/')
  .value('FIREBASE_ROOT', 'a-site-is-not-configured')
    .factory('FirebaseApi', function ($firebase, CurrentUser, FIREBASE_URL, FIREBASE_ROOT) {

        // get firebase references
        var rootRef = new Firebase(FIREBASE_URL + 'sites/' + FIREBASE_ROOT);

        // authorization utility function
        var authed = false;
        var afterAuthQueue = [];
        var authFn = function (fn, args, scope) {

          if (!authed) {

            // not authorized yet, keep track of functions to call when we are authed
            afterAuthQueue.push({
              fn: fn,
              args: args,
              scope: scope
            });

          } else {

            // we are authorized, just call the function normally
            fn.apply(scope, args);

          }

        };

        // ensure user is unauthed when they disconnect
        var connectedRef = new Firebase(FIREBASE_URL + '.info/connected');
        connectedRef.on('value', function (connected) {

          if (!connected.val()) {

            // user is no longer connected, unauthorize them from the server
            rootRef.unauth();

          }

        });

        var buildDisplayName = function () {

          // try to show first/last name, if not try email, then username
          return CurrentUser.data.first_name && CurrentUser.data.last_name
                      ? CurrentUser.data.first_name + ' ' + CurrentUser.data.last_name
                        : (CurrentUser.data.email || CurrentUser.data.username);

        };

        return {

            login: function () {

              // just skip this whole thing if we're already authed
              if (!authed && 'firebase_token' in CurrentUser.data && CurrentUser.data.firebase_token) {

                // authorize user
                rootRef.auth(CurrentUser.data.firebase_token, function (error) {

                  if (error) {

                    // authorization failed, log an error
                    console.error('Firebase login failed:', error);

                  } else {

                    // user now authorized, call all the queued functions
                    authed = true;
                    for (var i = 0; i < afterAuthQueue.length; i++) {

                      var param = afterAuthQueue[i];
                      authFn(param.fn, param.args, param.scope);

                    }

                  }

                });

              }

            },

            getActiveUsers: function (articleId, callback) {

              // use auth wrapper to ensure this function succeeds
              authFn(function (callbackArg) {

                callbackArg($firebase(rootRef.child('articles/' + articleId + '/users')));

              }, [callback], this);

            },

            registerCurrentUserActive: function (articleId) {

              // TODO : make sure firebase_token is avaiable

              // get active users then add current user
              this.getActiveUsers(articleId, function (activeUsers) {

                  var rawUser = {
                    id: CurrentUser.data.id,
                    displayName: buildDisplayName()
                  };

                  activeUsers.$asArray().$add(rawUser).then(function (userRef) {

                    // ensure user is removed on disconnect
                    userRef.onDisconnect().remove();

                  });

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
    /*This is a modal for browsing versions stored in localStorage by the Localstoragebackup service */
    Localstoragebackup.backupToLocalStorage();

    var keys = _.keys($window.localStorage);

    var timestamps = [];
    for (var i in keys) {
      if (keys[i] && (keys[i].split('.')[0] !== Localstoragebackup.keyPrefix || Number(keys[i].split('.')[2]) !== article.id)) {
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
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $route, $modalInstance, _, ContentApi, articleOnPage, articleOnServer) {
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

    this.openVideoThumbnailModal = function (videoId) {
      return $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/video-thumbnail-modal.html',
        controller: 'VideothumbnailmodalCtrl',
        resolve: {
          videoId: function () { return videoId; }
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
  .controller('VideothumbnailmodalCtrl', function ($scope, $http, $modalInstance, Zencoder, videoId, VIDEO_THUMBNAIL_URL, STATIC_IMAGE_URL) {
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
        $scope.video.poster = STATIC_IMAGE_URL.replace('{{ratio}}', '16x9').replace('{{image}}', $scope.uploadedImage.id);
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
        if (attrs.ratio) {
          var ratio = attrs.ratio;
        } else {
          var ratio = '16x9';
        }
        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl = STATIC_IMAGE_URL.replace('{{ratio}}', ratio).replace('{{image}}', scope.image.id);
          } else {
            scope.imageUrl = false;
          }
        });
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
      if (rejection.config && rejection.config.noPermissionIntercept) {
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
angular.module('bulbsCmsApp').factory('BadRequestInterceptor', function ($q, $injector, routes) {
    return {
      responseError: function (rejection) {
        $injector.invoke(function($modal){
          if (rejection.status === 400) {
            var detail = rejection.data || {'something': ['Something was wrong with your request.']};
            $modal.open({
              templateUrl: routes.PARTIALS_URL + 'modals/400-modal.html',
              controller: 'BadrequestmodalCtrl',
              resolve: {
                detail: function(){ return detail; }
              }
            });
          }
        });
        return $q.reject(rejection);
      }
    }
  });
'use strict';

angular.module('bulbsCmsApp')
  .controller('BadrequestmodalCtrl', function ($scope, $modalInstance, detail) {
    $scope.detail = detail;
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('lazyInclude', function (routes, $, $compile, $q, $http, $templateCache, Gettemplate) {
    /*
      this is like ng-include but it doesn't compile/render the included template
      until the child element is visible
      intended to help with responsiveness by cutting down requests and rendering time
    */

    return {
      restrict: 'A',
      scope: true,
      link: function(scope, element, attrs){
        var templateUrl = routes.PARTIALS_URL + attrs.template;
        var $element = $(element);
        
        scope.$evalAsync(function(){
          scope.$watch(function(){
            return $element.is(':visible');
          }, function(visible){
            if(visible && !scope.loaded){
              scope.loaded = true;
              Gettemplate.get(templateUrl).then(function(html){
                var template = angular.element(html);
                var compiledEl = $compile(template)(scope);
                element.html(compiledEl);
                element.css('height', 'auto');
              });
            }
          });
        });
        
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .service('Gettemplate', function Gettemplate($templateCache, $q, $http) {
    this.get = function (templateUrl) {
      var template = $templateCache.get(templateUrl);
      if (template) {
        return $q.when(template);
      }else {
        var deferred = $q.defer();
        $http.get(templateUrl, {cache: true}).success(function (html) {
          $templateCache.put(templateUrl, html);
          deferred.resolve(html);
        });
        
        return deferred.promise;
      }
    }
  });
