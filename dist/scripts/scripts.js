'use strict';
/*

Image

This bridges the embed module that the editor exposes & our custom image implementation.

*/


/* prevents backspace from accidentally triggering a back event */

// TODO : fix this at some point so we don't use global $
/* global $ */

$(document).unbind('keydown').bind('keydown', function (event) {
  var doPrevent = false;
  if (event.keyCode === 8) {
    var d = event.srcElement || event.target;
    if (['TEXTAREA', 'INPUT'].indexOf(d.tagName.toUpperCase() !==  -1)) {
      doPrevent = d.readOnly || d.disabled;
    } else if (d.isContentEditable) {
      //we're in a content editable field
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

angular.module('lodash', []).constant('_', window._);
angular.module('URLify', []).constant('URLify', window.URLify);
angular.module('jquery', []).constant('$', window.$);
angular.module('moment', []).constant('moment', window.moment);
angular.module('PNotify', []).constant('PNotify', window.PNotify);
angular.module('keypress', []).constant('keypress', window.keypress);
angular.module('Raven', []).constant('Raven', window.Raven);
angular.module('OnionEditor', []).constant('OnionEditor', window.OnionEditor);

// ****** App Config ****** \\

angular.module('bulbsCmsApp.settings', [
  'ngClipboard'
])
  .config(function (ngClipProvider, ZERO_CLIPBOARD_SWF) {
    ngClipProvider.setPath(ZERO_CLIPBOARD_SWF);
  });

angular.module('bulbsCmsApp', [
  // unorganized
  'bulbsCmsApp.settings',
  'bulbs.api',
  // external
  'BettyCropper',
  'ipCookie',
  'jquery',
  'keypress',
  'lodash',
  'moment',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'OnionEditor',
  'PNotify',
  'Raven',
  'restangular',
  'tokenAuth',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'URLify',
  // shared
  'backendApiHref',
  'contentServices',
  'cms.config',
  'cms.firebase.config',
  'cms.image',
  'cms.templates',
  'currentUser',
  // components
  'bettyEditable',
  'bugReporter',
  'campaigns',
  'content',
  'content.video',
  'filterWidget',
  'filterListWidget',
  'promotedContent',
  'sections',
  'sendToEditor',
  'specialCoverage',
  'statusFilter',
  'templateTypeField',
  'specialCoverage',
  'sections',
  'reports',
  // TODO : remove these, here because they are used by unrefactored compontents
  'content.edit.versionBrowser.modal.opener'
])
  .config([
    '$provide', '$httpProvider', '$locationProvider', '$routeProvider', '$sceProvider',
      'TokenAuthConfigProvider', 'TokenAuthServiceProvider', 'CmsConfigProvider',
      'COMPONENTS_URL', 'PARTIALS_URL', 'FirebaseConfigProvider',
    function ($provide, $httpProvider, $locationProvider, $routeProvider, $sceProvider,
        TokenAuthConfigProvider, TokenAuthServiceProvider, CmsConfigProvider,
        COMPONENTS_URL, PARTIALS_URL, FirebaseConfigProvider) {

      // FirebaseConfigProvider
      //   .setDbUrl('')
      //   .setSiteRoot('sites/bulbs-cms-testing');

      $locationProvider.html5Mode(true);

      $routeProvider
        .when('/', {
          templateUrl: PARTIALS_URL + 'contentlist.html',
          controller: 'ContentlistCtrl',
          reloadOnSearch: false
        })
        .when('/cms/app/list/', {
          redirectTo: '/'
        })
        .when('/cms/app/edit/:id/contributions/', {
          templateUrl: PARTIALS_URL + 'contributions.html',
          controller: 'ContributionsCtrl'
        })
        .when('/cms/app/targeting/', {
          templateUrl: PARTIALS_URL + 'targeting-editor.html',
          controller: 'TargetingCtrl'
        })
        .when('/cms/app/notifications/', {
          templateUrl: PARTIALS_URL + 'cms-notifications.html',
          controller: 'CmsNotificationsCtrl'
        })
        .when('/cms/app/pzones/', {
          templateUrl: PARTIALS_URL + 'pzones.html',
          controller: 'PzoneCtrl'
        })
        .when('/cms/login/', {
          templateUrl: COMPONENTS_URL + 'login/login.html'
        })
        .otherwise({
          templateUrl: '/404.html'
        });

      CmsConfigProvider.setLogoutCallback(function () {
        TokenAuthServiceProvider.$get().logout();
      });

      CmsConfigProvider.addEditPageMapping(
        '/components/edit-pages/video/video-container.html',
        'core_video');

      TokenAuthConfigProvider.setApiEndpointAuth('/token/auth');
      TokenAuthConfigProvider.setApiEndpointRefresh('/token/refresh');
      TokenAuthConfigProvider.setApiEndpointVerify('/token/verify');
      TokenAuthConfigProvider.setLoginPagePath('/cms/login/');

      //TODO: whitelist staticonion.
      $sceProvider.enabled(false);
      /*.resourceUrlWhitelist([
      'self',
      STATIC_URL + "**"]);*/

      $provide.decorator('$exceptionHandler', function ($delegate) {
        return function (exception, cause) {
          $delegate(exception, cause);
          window.Raven.captureException(exception);
        };
      });

      $httpProvider.interceptors.push('BugReportInterceptor');
      $httpProvider.interceptors.push('BadRequestInterceptor');
    }
  ])
  .run([
    '$rootScope', '$http', '$cookies',
    function ($rootScope, $http, $cookies) {
      // set the CSRF token here
      $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
      var deleteHeaders = $http.defaults.headers.delete || {};
      deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
      $http.defaults.headers.delete = deleteHeaders;
    }
  ]);

'use strict';

angular.module('bulbs.api', [
  'bulbsCmsApp.settings',
  'restangular',
  'moment'
])
  .config(function (RestangularProvider, RESTANGULAR_API_URL_ROOT) {
    RestangularProvider.setBaseUrl(RESTANGULAR_API_URL_ROOT);
    RestangularProvider.setRequestSuffix('/');
  });

'use strict';

angular.module('bulbs.api')
  .factory('AuthorService', function (Restangular) {
    Restangular.extendModel('author', function (obj) {
      return angular.extend(obj, {
        getFullName: function () {
          return obj.first_name + ' ' + obj.last_name;
        }
      });
    });
    return Restangular.all('author');
  });

'use strict';

angular.module('bulbs.api')
  .factory('ContentService', function (Restangular) {

    Restangular.extendModel('content', function (obj) {

      var extendAuthor = function (author) {
        return angular.extend(author, {
          getFullName: function () {
            return obj.contributor.first_name + ' ' + obj.contributor.last_name;
          }
        });
      };

      for (var i in obj.authors) {
        obj.authors[i] = extendAuthor(obj.authors[i]);
      }
      return obj;
    });

    Restangular.extendModel('contributions', function (obj) {
      if (obj && obj.contributor) {
        obj.contributor = angular.extend(obj.contributor, {
          getFullName: function () {
            return obj.contributor.first_name + ' ' + obj.contributor.last_name;
          }
        });
      }
      return obj;
    });

    Restangular.extendCollection('contributions', function (collection) {
      collection.save = function (data) {
        return collection.post(data).then(function (contributions) {
          return Restangular.restangularizeCollection('contributions', contributions);
        });
      };
      return collection;
    });

    return Restangular.service('content');
  });

'use strict';

angular.module('bulbs.api')
  .factory('ContributionRoleService', function (Restangular) {
    return Restangular.service('contributions/role');
  })
  .factory('ContentReportingService', function (Restangular) {
    return Restangular.service('contributions/contentreporting');
  })
  .factory('FreelancePayReportingService', function(Restangular, moment) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl('/cms/api/v1/contributions/');
      RestangularConfigurer.setRequestSuffix('/');
    }).service('freelancereporting');
  })
  .factory('ContributionReportingService', function (Restangular, moment) {

    Restangular.extendModel('reporting', function (obj) {
      obj.user = angular.extend(obj.user, {
        toString: function () {
          return obj.user.full_name || obj.user.username;
        }
      });

      obj.content = angular.extend(obj.content, {
        toString: function () {
          return obj.content.title + ' (' + moment(obj.content.published).format('MM/DD/YYYY h:mm a') + ')';
        },
      });
      return obj;
    });

    return Restangular.service('contributions/reporting');
  });

'use strict';
(function () {
  angular.module('BettyCropper', [
      'cms.config',
      'restangular',
      'jquery'
    ])
    .value('DEFAULT_IMAGE_WIDTH', 1200)
    .factory('Selection', SelectionFactory)
    .factory('BettyImage', BettyImageFactory)
    .service('BettyCropper', BettyCropperService);

  function BettyCropperService($http, $interpolate, $q, CmsConfig, BettyImage, $) {
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
            url: CmsConfig.buildImageServerUrl('/api/new'),
            headers: {
              'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
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
          url: CmsConfig.buildImageServerUrl('/api/' + id),
          headers: {
            'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
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
          url: CmsConfig.buildImageServerUrl('/api/' + id),
          headers: {
            'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
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
          url: CmsConfig.buildImageServerUrl('/api/' + id + '/' + ratio),
          headers: {
            'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
            'Content-Type': undefined,
            'X-CSRFToken': undefined
          },
          data: selections
        });
      }
    }

  function BettyImageFactory($interpolate, $http, CmsConfig, Selection, $) {
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

    BettyImage.prototype.scaleToFit = function (width, height) {
      var scale;
      if (width && height) {
        var fitRatio = width / height;
        var thisRatio = this.width / this.height;
        if (fitRatio > thisRatio) {
          scale = height / this.height;
        } else {
          scale = width / this.width;
        }
      } else {
        if (width) {
          scale = width / this.width;
        }
        if (height) {
          scale = height / this.height;
        }
      }
      var scaled = {
        width: Math.round(this.width * scale),
        height: Math.round(this.height * scale),
        scale: scale
      };
      return scaled;
    };

    BettyImage.prototype.getStyles = function (width, height, ratio) {
      if (height === 0) {
        height = null;
      }

      var selection = this.selections[ratio];
      var scaledSelection = selection.scaleToFit(width, height);

      return {
        'background-image': 'url(' + this.url('original', CmsConfig.getImageDefaultWidth(), 'jpg') + ')',
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
      for (var i = 0; i < idStr.length; i++) {
        if (i % 4 === 0 && i !== 0) {
          segmentedId += '/';
        }
        segmentedId += idStr.substr(i, 1);
      }
      return exp({
        base_url: CmsConfig.buildImageServerUrl(),
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
        url: CmsConfig.buildImageServerUrl('/api/' + this.id + '/' + ratio),
        headers: {
          'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
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

    Selection.prototype.scaleBy = function (scale) {
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
          scale = height / this.height();
        } else {
          scale = width / this.width();
        }
      } else {
        if (width) {
          scale = width / this.width();
        }
        if (height) {
          scale = height / this.height();
        }
      }
      return this.scaleBy(scale);
    };

    return Selection;
  }
})();

'use strict';

/**
 * Autocomplete directive that should cover most autocomplete situations.
 */
angular.module('autocompleteBasic', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'bulbsCmsApp.settings'
])
  .value('AUTOCOMPLETE_BASIC_DEBOUNCE', 200)
  .directive('autocompleteBasic', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, AUTOCOMPLETE_BASIC_DEBOUNCE) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.currentSelection = null;
        $scope.autocompleteItems = [];

        var $getItems = function () {
          return $scope.searchFunction($scope.writables.searchTerm)
            .then(function (data) {
              return _.map(data, function (item) {
                return {
                  name: $scope.itemDisplayFormatter({item: item}),
                  value: item
                };
              });
            });
        };

        $scope.updateAutocomplete = _.debounce(function () {
          if ($scope.writables.searchTerm) {
            $getItems().then(function (results) {
              $scope.autocompleteItems = results;
            });
          }
        }, AUTOCOMPLETE_BASIC_DEBOUNCE);

        $scope.delayClearAutocomplete = function () {
          _.delay(function () {
            $scope.clearAutocomplete();
            $scope.$digest();
          }, 200);
        };

        $scope.clearAutocomplete = function () {
          $scope.writables.searchTerm = '';
          $scope.autocompleteItems = [];
        };

        $scope.clearSelectionOverlay = function () {
          $scope.clearAutocomplete();
          $scope.showSelectionOverlay = false;
          $scope.updateNgModel(null);
          $scope.onSelect({selection: null});
        };

        $scope.handleKeypress = function ($event) {
          if ($event.keyCode === 27) {
            // esc, close dropdown
            $scope.clearAutocomplete();
          } else if ($event.keyCode === 40 && _.isEmpty($scope.autocompleteItems)) {
              // down key and no items in autocomplete, redo search
              $scope.updateAutocomplete();
          } else {
            $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
          }
        };

        $scope.handleSelect = function (selection) {
          if (!selection && $scope.allowInputValueSelection()) {
            selection = {
              name: $scope.writables.searchTerm,
              value: $scope.writables.searchTerm
            };
          }

          if ($scope.updateNgModel) {
            $scope.updateNgModel(selection);
            $scope.showSelectionOverlay = true;
          }

          $scope.clearAutocomplete();
          $scope.onSelect({selection: selection});
        };
      },
      link: function (scope, iElement, iAttrs, ngModelCtrl) {
        if (ngModelCtrl) {
          ngModelCtrl.$formatters.push(function (modelValue) {
            scope.currentSelection = modelValue;
            return modelValue;
          });

          ngModelCtrl.$parsers.push(function (viewValue) {
            scope.currentSelection = viewValue;
            return viewValue;
          });

          scope.updateNgModel = function (selection) {
            var newViewValue = null;
            if (selection && selection.value) {
              newViewValue = selection.value;
            }
            ngModelCtrl.$setViewValue(newViewValue);
          };
        }
      },
      require: '?ngModel',            // optionally provide ng-model to have bind directly with a property
      restrict: 'E',
      scope: {
        hideSearchIcon: '&',          // true to hide search icon inside autocomplete
        inputId: '@',                 // id to give input, useful if input has a label
        inputPlaceholder: '@',        // placeholder for input
        itemDisplayFormatter: '&',    // formatter to use for autocomplete results
        onSelect: '&',                // selection callback, recieves selection as argument
        searchFunction: '=',          // function to use for searching autocomplete results
        allowInputValueSelection: '&' // true to allow input to retain the value of the input even if that value hasn't been selected from results
      },
      templateUrl: COMPONENTS_URL + 'autocomplete-basic/autocomplete-basic.html'
    };
  });

'use strict';

angular.module('bettyEditable', [
  'BettyCropper',
  'bulbsCmsApp.settings'
])
  .directive('bettyEditable',[
    '$http', 'COMPONENTS_URL', 'BettyCropper', 'openImageCropModal', 'DEFAULT_IMAGE_WIDTH',
    function ($http, COMPONENTS_URL, BettyCropper, openImageCropModal, DEFAULT_IMAGE_WIDTH) {
      return {
        restrict: 'E',
        templateUrl: COMPONENTS_URL + 'betty-editable/betty-editable.html',
        scope: {
          addStyles: '@',
          editable: '=?',
          hideMetas: '=',
          image: '=',
          placeholderText: '@',
          ratio: '@'
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
                BettyCropper.get($scope.image.id).then(function (response) {
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
              scope.imageStyling = scope.bettyImage.getStyles(element.parent().width(), null, scope.ratio);
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

          scope.$watch('image', function (newImage, oldImage) {
            if (newImage && newImage.id) {
              BettyCropper.get(newImage.id).then(function (response) {
                scope.bettyImage = response.data;
              });
            }
          });

          scope.$watch('bettyImage', function (newImage, oldImage) {
            scope.setStyles();
          }, true);

          element.resize(scope.setStyles);

          scope.removeImage = function () {
            scope.image = null;
          };

          scope.editImage = function () {
            openImageCropModal(scope.image)
            .then(function (success) {
              console.log(success);
            });
          };

        }
      };
    }
  ]);

'use strict';

angular.module('bugReporter', [])
  .directive('bugReporter', [
    '$http', '$window', 'COMPONENTS_URL',
    function ($http, $window, COMPONENTS_URL) {
      return {
        restrict: 'E',
        templateUrl: COMPONENTS_URL + 'bug-reporter/bug-reporter-button.html',
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
    }
  ]);

'use strict';

angular.module('campaigns.edit.directive', [
  'apiServices.campaign.factory',
  'BettyCropper',
  'bulbsCmsApp.settings',
  'campaigns.edit.sponsorPixel',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .directive('campaignsEdit', function (COMPONENTS_URL) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, Campaign) {

        // populate model for use
        if ($routeParams.id === 'new') {
          $scope.model = Campaign.$build();
          $scope.isNew = true;
        } else {
          $scope.model = Campaign.$find($routeParams.id);
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.addPixel = function () {
          var pixel = {
            url: '',
            campaign_type: ''
          };
          $scope.model.pixels.push(pixel);
        };

        $scope.deletePixel = function (pixel) {
          $scope.model.pixels = _.without($scope.model.pixels, pixel);
        };

        // set up save state function
        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/campaigns/edit/' + data.id + '/');
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: COMPONENTS_URL + 'campaigns/campaigns-edit/campaigns-edit.html',
    };
  });

'use strict';

angular.module('campaigns.edit.sponsorPixel.directive', [
  'bulbsCmsApp.settings'
])
  .constant('PIXEL_TYPES', [
    {
      name: 'Listing',
      value: 'Listing'
    },
    {
      name: 'Detail',
      value: 'Detail'
    }
  ])
  .directive('campaignsEditSponsorPixel', function (COMPONENTS_URL) {
    return {
      controller: function($scope, PIXEL_TYPES) {
        $scope.PIXEL_TYPES = PIXEL_TYPES;
      },
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: COMPONENTS_URL + 'campaigns/campaigns-edit/campaigns-edit-sponsor-pixel/campaigns-edit-sponsor-pixel.html'
    };
  });

'use strict';

angular.module('campaigns.edit.sponsorPixel', [
  'campaigns.edit.sponsorPixel.directive'
]);

'use strict';

angular.module('campaigns.edit', [
  'campaigns.edit.directive'
])
  .config(function ($routeProvider, CMS_NAMESPACE) {
    $routeProvider
    .when('/cms/app/campaigns/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {

        // set title
        $window.document.title = CMS_NAMESPACE + ' | Edit Campaign';

        $scope.routeId = $routeParams.id;
      },
      template: '<campaigns-edit model-id="routeId"></campaigns-edit>',
      reloadOnSearch: false
    });
  });

'use strict';

angular.module('campaigns.list', [
  'apiServices.campaign.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'moment'
])
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/campaigns/', {
        controller: function ($scope, $window, Campaign) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Campaign';

          $scope.modelFactory = Campaign;
        },
        templateUrl: COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html'
      });
  });

'use strict';

angular.module('campaigns', [
  'campaigns.edit',
  'campaigns.list'
]);

'use strict';

angular.module('confirmationModal', [
  'bulbsCmsApp.settings',
  'confirmationModal.factory'
])
  .directive('confirmationModalOpener', function (ConfirmationModal) {
    return {
      restrict: 'A',
      scope: {
        modalBody: '@',
        modalCancelText: '@',
        modalOkText: '@',
        modalOnCancel: '&',
        modalOnOk: '&',
        modalTitle: '@'
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('confirmation-modal-opener');
        element.on('click', function () {
          modalInstance = new ConfirmationModal(scope);
        });
      }
    };
  });

'use strict';

angular.module('confirmationModal.factory', [
  'bulbsCmsApp.settings',
  'ui.bootstrap.modal'
])
  .factory('ConfirmationModal', function ($modal, COMPONENTS_URL) {

    var ConfirmationModal = function (scope) {
      return (function (scope) {
        $modal
          .open({
            controller: function ($scope, $modalInstance) {
              $scope.confirm = function () {
                $scope.$close();
                if ($scope.modalOnOk) {
                  $scope.modalOnOk();
                }
              };

              $scope.cancel = function () {
                $scope.$dismiss();
                if ($scope.modalOnCancel) {
                  $scope.modalOnCancel();
                }
              };
            },
            scope: scope,
            templateUrl: COMPONENTS_URL + 'confirmation-modal/confirmation-modal.html'
          });
      })(scope);
    };

    return ConfirmationModal;
  });

'use strict';

angular.module('content.edit.authors', [
  'apiServices.author.factory',
  'bulbsCmsApp.settings',
  'filters.userDisplay',
  'lodash',
  'tagList',
  'uuid4'
])
  .directive('contentEditAuthors', [
    'COMPONENTS_URL', 'uuid4',
    function (COMPONENTS_URL, uuid4) {
      return {
        controller: [
          '_', '$scope', 'Author',
          function (_, $scope, Author) {

            $scope.addAuthor = function (author) {
              var alreadyInList =
                _.find($scope.article.authors, function (articleAuthor) {
                  return articleAuthor.id === author.id;
                });

              if (!alreadyInList) {
                var newAuthor = {
                  first_name: author.firstName,
                  id: author.id,
                  last_name: author.lastName,
                  username: author.username
                };

                $scope.article.authors.push(newAuthor);
              }
            };

            $scope.searchAuthors = function (query) {
              return Author.$search({
                ordering: 'name',
                search: query
              })
              .$asPromise();
            };
          }
        ],
        link: function (scope) {
          scope.uuid = uuid4.generate();
        },
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-authors/content-edit-authors.html'
      };
    }
  ]);

'use strict';

angular.module('content.edit.body', [
  'cms.config'
])
  .directive('contentEditBody', function (CmsConfig, COMPONENTS_URL) {
    return {
      link: function (scope) {
        scope.inlineObjectsUrl = CmsConfig.getInlineObjectsUrl();
      },
      restrict: 'E',
      scope: {
        article: '=',
        linkDomain: '@',
        searchHandler: '@'
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-body/content-edit-body.html'
    };
  });

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

'use strict';

angular.module('content.edit.editorItem.service', [
  'cms.config'
])
  .service('EditorItems', [
    '$http', 'CmsConfig',
    function EditorItems($http, CmsConfig) {
      this.data = [];
      var self = this;
      this.getItems = function (article) {
        $http.get(
          CmsConfig.buildBackendApiUrl('content/' + article + '/send/')
        ).success(function (data, status) {
          self.data = data.editor_items;
        });
      };
    }]);

'use strict';

angular.module('content.edit.editorItem', [
  'bulbsCmsApp.settings',
  'content.edit.editorItem.service',
  'moment'
])
  .directive('editorItem', [
    'EditorItems', 'moment', 'COMPONENTS_URL',
    function (EditorItems, moment, COMPONENTS_URL) {
      return {
        restrict: 'E',
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-editor-item/content-edit-editor-item.html',
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {

          EditorItems.getItems(scope.article.id || '');

          scope.editorItems = EditorItems;

          scope.parseCreated = function (date) {
            return moment(date).format('h:mm A MMM D');
          };
        }
      };
    }]);

'use strict';

/**
 * When adding links in the editor, allows searching through content to link.
 */
angular.module('content.edit.linkBrowser', [
  'cms.config',
  'jquery'
])
  .service('LinkBrowser', function ($, $http, CmsConfig) {
     window.linkBrowser = function(term, resultsElement) {
       resultsElement.html('<div class="items"></div><hr><span class="type">Articles</span><ul class="content"></ul>');

       $http.get(CmsConfig.buildBackendApiUrl('search/autocomplete?q=' + term))
         .success(function(resp) {
           $('.items', resultsElement).html(resp);
         });

       $http.get(CmsConfig.buildBackendApiUrl('content/?search=' + term))
         .success(function(resp) {
           for (var i=0; i < Math.min(resp.count, 20); i ++) {
             var link = $('<A>')
               .attr('href',resp.results[i].absolute_url)
               .html('<span class="feature_type">' + resp.results[i].feature_type + '</span>' + resp.results[i].title);
             $('.content', resultsElement).append($('<li>').append(link));
           }
         });
     };
  });

'use strict';

angular.module('content.edit.mainImage', [
  'BettyCropper'
])
  .directive('contentEditMainImage', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-main-image/content-edit-main-image.html'
    };
  });

'use strict';

angular.module('content.edit.section', [
  'apiServices.section.factory',
  'bulbsCmsApp.settings',
  'utils',
  'uuid4'
])
  .directive('contentEditSection', [
    'COMPONENTS_URL', 'Utils', 'uuid4',
    function (COMPONENTS_URL, Utils, uuid4) {
      return {
        controller: [
          '$scope', 'Section',
          function ($scope, Section) {

            $scope.searchSections = function (query) {
              return Section.$search({
                ordering: 'name',
                search: query
              })
              .$asPromise();
            };
          }
        ],
        link: function (scope) {
          scope.uuid = uuid4.generate();
        },
        restrict: 'E',
        scope: {
          article: '=',
          onSelect: '&'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'content',
          'content-edit',
          'content-edit-section',
          'content-edit-section.html'
        )
      };
    }
  ]);

'use strict';

angular.module('content.edit.tags', [
  'apiServices.tag.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'tagList',
  'uuid4'
])
  .directive('contentEditTags', [
    'COMPONENTS_URL', 'uuid4',
    function (COMPONENTS_URL, uuid4) {
      return {
        controller: [
          '_', '$scope', 'Tag',
          function (_, $scope, Tag) {

            $scope.addTag = function (tag) {
              var tagIsString = typeof tag === 'string';

              var alreadyInList =
                _.find($scope.article.tags, function (articleTag) {
                  return tagIsString ? articleTag.name === tag : articleTag.id === tag.id;
                });

              if (!alreadyInList) {
                var newTag = {
                  type: 'content_tag'
                };
                if (tagIsString) {
                  newTag.name = tag;
                  newTag.new = true;
                } else {
                  newTag.id = tag.id;
                  newTag.name = tag.name;
                }

                $scope.article.tags.push(newTag);
              }
            };

            $scope.searchTags = function (query) {
              return Tag.$search({
                ordering: 'name',
                search: query
              })
              .$asPromise();
            };
          }
        ],
        link: function (scope) {
          scope.uuid = uuid4.generate();
        },
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-tags/content-edit-tags.html'
      };
    }
  ]);

'use strict';

/**
 * Directive that will choose an edit template based on an article's polymorphic_ctype.
 */
angular.module('content.edit.templateChooser', [
  'cms.config'
])
  .directive('contentEditTemplateChooser', [
    'CmsConfig', 'COMPONENTS_URL',
    function (CmsConfig, COMPONENTS_URL) {
      var defaultView = COMPONENTS_URL + 'content/content-edit/type-error.html';

      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        controller: function ($scope, $templateCache) {
          $scope.template = defaultView;
          try {
            var template = CmsConfig.getEditPageTemplateUrl($scope.article.polymorphic_ctype);

            // need this logic to prevent a stupid infinite redirect loop if template doesn't exist
            if ($templateCache.get(template)) {
              // template actually exists, use it
              $scope.template = template;
            } else {
              // we're headed to the error page, set hte error message
              $scope.error = 'Unable to find template for type "' + $scope.article.polymorphic_ctype + '"';
            }
          } catch (e) {
            $scope.error = e.message;
          }
        },
        template: '<div ng-include="template"></div>'
      };
    }]);

'use strict';

angular.module('content.edit.title', [
  'bulbsCmsApp.settings'
])
  .directive('contentEditTitle', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-title/content-edit-title.html'
    };
  });

'use strict';

/**
 * Methods to create and retrieve versions in local storage. Articles are stored as json strings under the keys
 *  'article.{timestamp}.{article id}'. When local storage is full, it will attempt to remove values older than
 *  yesterday.
 */
angular.module('content.edit.versionBrowser.api.backup', [
  'currentUser',
  'lodash',
  'moment'
])
  .factory('LocalStorageBackup', [
    '_', '$q', '$routeParams', '$window', 'CurrentUser', 'moment',
    function ($q, $routeParams, $window, moment, _, CurrentUser) {

      var keyPrefixArticle = 'article';
      var keyPrefix = keyPrefixArticle + '.' + $routeParams.id + '.';

      return {

        /**
         * Save content to local storage.
         *
         * @param articleData   Content to save to local storage.
         * @return New version data or null if no version was created.
         */
        $create: function (articleData) {

          var createDefer = $q.defer(),
              createPromise = createDefer.promise;

          // check if we have local storage
          if ($window.localStorage) {
            CurrentUser.$simplified().then(function (user) {

              // create new version object
              var version = {
                timestamp: moment().valueOf(),
                user: user,
                content: articleData
              };

              try {

                // create new local storage item with version content
                $window.localStorage.setItem(keyPrefix + moment().valueOf(), JSON.stringify(version));
                createDefer.resolve(version);

              } catch (error) {

                // some error occurred, prune entries older than yesterday
                console.log('Caught localStorage error: ' +  error);
                console.log('Pruning old entries...');

                // loop through local storage keys and see if they're old
                _.chain($window.localStorage)
                  // pick keys that are articles and that are older than yesterday
                  .pick(function (value, key) {
                    var keySplit = key.split('.'),
                      pickForRemoval = false;
                    // check that this is an article in storage
                    if (keySplit.length === 3 && keySplit[0] === keyPrefixArticle) {
                      var yesterday = moment().subtract({days: 1}).valueOf(),
                        keyTime = Number(keySplit[2]);
                      // if older than yesterday, pick the key for removal
                      pickForRemoval = keyTime < yesterday;
                    }
                    // return our result
                    return pickForRemoval;
                  })
                  // these keys should be removed from local storage
                  .each(function (value, key) {
                    $window.localStorage.removeItem(key);
                  });

                // now try to add entry again
                try {
                  $window.localStorage.setItem(version.timestamp, JSON.stringify(version.content));
                  createDefer.resolve(version);
                } catch (error) {
                  // total failure, reject with an error.
                  console.log('Maybe you\'ve been saving too much? Failed again at adding entry, no more retries: ' + error);
                  createDefer.reject('Maybe you\'ve been saving too much? Failed again at adding entry, no more retries: ' + error);
                }
              }
            });

          } else {
            // no local storage, why are we here?
            createDefer.reject('You don\'t have local storage capabilities in your browser. Use a better browser.');
          }

          return createPromise;

        },
        /**
         * Get all versions for this article in local storage. No guarantee of order.
         *
         * @return  objects returned contain a timestamp and a content variable which holds the version's content.
         */
        $versions: function () {

          // note: using a promise here to better match the version api functionality
          var retrieveDefer = $q.defer(),
              retrievePromise = retrieveDefer.promise,
              versions =
                // loop through entries of local storage
                _.chain($window.localStorage)
                  // pick only entries that are for this particular article
                  .pick(function (stored, key) {
                    var keySplit = key.split('.');
                    return keySplit.length === 3 && keySplit[0] === keyPrefixArticle && keySplit[1] === $routeParams.id;
                  })
                  // parse and map these entries into an array
                  .map(function (stored) {
                    return JSON.parse(stored);
                  })
                // return the array of version objects
                .value();

          retrieveDefer.resolve(versions);

          return retrievePromise;

        }

      };

    }
  ]);

'use strict';

/**
 * This is a modal for browsing versions stored in localStorage by the LocalStorageBackup service.
 */
angular.module('content.edit.versionBrowser.modal.controller', [
  'cms.firebase',
  'content.edit.versionBrowser.api',
  'lodash'
])
  .controller('VersionBrowserModalCtrl', [
    '_', '$modalInstance', '$scope', 'FirebaseApi', 'FirebaseConfig', 'moment', 'VersionStorageApi',
    function (_, $modalInstance, $scope, FirebaseApi, FirebaseConfig, moment, VersionStorageApi) {

      // if we have fire base, show the maximum number of versions allowed
      FirebaseApi.$authorize().then(function () {
        $scope.maxVersions =  FirebaseConfig.getMaxArticleVersions();
      });

      VersionStorageApi.$all()
        .then(function (versions) {

          // doubley ensure timestamp in desc since modal functionality depends on it, add some extra display stuff
          $scope.versions =
            _.chain(versions)
              // loop through each version and add timestamp display property
              .each(function (version) {
                version.timestamp_display = moment(version.timestamp).format('MMM Do YYYY, h:mma');
              })
              // sort by timestamps desc, so most recent is on top
              .sortBy(function (version) {
                return -version.timestamp;
              })
            .value();

          // set initial preview to top item which should be the most recent
          $scope.selectedVersion = $scope.versions[0];

          // set preview in modal window based on timestamp
          $scope.setPreview = function (version) {
            $scope.selectedVersion = version;
          };

          // restore selected version preview
          $scope.restoreSelected = function () {

            // loop through each key of selected version and replace corresponding value in article
            _.each($scope.selectedVersion.content, function (value, key) {
              $scope.article[key] = value;
            });

            // mark article as dirty now that we've restored an old version
            $scope.articleIsDirty = true;

            // close modal
            $modalInstance.close();
          };

        });

    }
  ]);

'use strict';

angular.module('content.edit.versionBrowser.modal.opener', [
  'bulbsCmsApp.settings',
  'content.edit.versionBrowser.modal.controller',
  'utils'
])
  .factory('VersionBrowserModalOpener', [
    '$modal', 'COMPONENTS_URL', 'Utils',
    function ($modal, COMPONENTS_URL, Utils) {

      var modal = null;

      return {
        open: function ($scope, article) {
          // ensure only one version browser modal is open at a time
          if (modal) {
            modal.close();
          }

          modal = $modal.open({
            templateUrl: Utils.path.join(
              COMPONENTS_URL,
              'content',
              'content-edit',
              'content-edit-version-browser',
              'content-edit-version-browser-modal.html'),
            controller: 'VersionBrowserModalCtrl',
            scope: $scope,
            size: 'lg',
            resolve: {
              article: function () {
                return article;
              }
            }
          });

          return modal;
        }
      };
    }
  ]);

'use strict';

/**
 * Api for saving article versions. Will automatically detect and attempt to use firebase, otherwise local storage
 *  will be used for versions.
 *
 * This API expects all version objects to be in at least the following form:
 *
 *  {
 *    timestamp: Number   - timestamp in ms for this version
 *    content: Object     - content this version holds, which in this case is an article object
 *  }
 */
angular.module('content.edit.versionBrowser.api', [
  'content.edit.versionBrowser.api.backup',
  'cms.firebase'
])
  .factory('VersionStorageApi', [
    '_', '$q', 'FirebaseApi', 'FirebaseArticleFactory', 'LocalStorageBackup',
    function (_, $q, FirebaseApi, FirebaseArticleFactory, LocalStorageBackup) {

      // set up a promise for checking if we can authorize with firebase
      var firebaseAvailableDefer = $q.defer(),
          $firebaseAvailable = firebaseAvailableDefer.promise;
      FirebaseApi.$authorize()
        .then(function () {

          // we have a firebase connection, use firebase for versioning
          firebaseAvailableDefer.resolve(FirebaseArticleFactory.$retrieveCurrentArticle());

        })
        .catch(function () {

          // we don't have a firebase connection, use local storage for versioning
          firebaseAvailableDefer.reject();

        });

      /**
       * Memoized omitting function for deep scrubbing.
       */
      var _omitter = _.memoize(
        function (value, key) {
          return _.isFunction(value) ||
                    _.find(key, function (c) {
                      return c === '.' || c === '#' || c === '$' || c === '/' || c === '[' || c === ']';
                    });
        },
        function (value, key) {
          return [key, value];
        });

      /**
       * Recursively scrub object of functions and turn undefines into null, makes object valid for saving in firebase.
       *
       * @param obj   object to recurse through
       */
      var _deepScrub = function (obj) {

        var clone, transValue;

        if (_.isUndefined(obj)) {
          // turn undefineds into nulls, this allows deletion of property values
          clone = null;
        } else if (_.isPlainObject(obj)) {
          // this is an object, use omit to recurse through its members
          clone = {};
          _.forOwn(obj, function (value, key) {
            // run value through recursive omit call
            transValue = _deepScrub(value);
            // check if this should be omitted, if not clone it over
            if (!_omitter(transValue, key)) {
              clone[key] = transValue;
            }
          });
        } else if (_.isArray(obj)) {
          // this is an array, loop through items use omit to decide what to do with them
          clone = [];
          _.each(obj, function (value, key) {
            // run value through recursive omit call
            transValue = _deepScrub(value);
            // check if this should be omitted, if not clone over
            if (!_omitter(transValue, key)) {
              clone.push(transValue);
            }
          });
        } else {
          // not a special case, just return object
          clone = obj;
        }

        return clone;

      };

      /**
       * Keep only the data we want to persist for an article. Does a deep clone to scrub sub-objects.
       *
       * @param articleData   data to scrub.
       */
      var scrubArticle = function (articleData) {

        return _deepScrub(articleData);

      };

      return {

        /**
         * Create a new version either in firebase or in local storage.
         *
         * @param rawArticleData  raw article data to copy and transform before saving.
         * @param articleIsDirty  true if the article has unsaved changes, false otherwise.
         * @return  a promise that resolves on creation with a version object that contains timestamp and content
         *  properties.
         */
        $create: function (rawArticleData, articleIsDirty) {

          // get article data that we want to save
          var articleData = scrubArticle(rawArticleData);

          // create deferred to return
          var createDefer = $q.defer(),
              createPromise = createDefer.promise;

          // article is dirty and should be saved, check if firebase is being used
          $firebaseAvailable
            .then(function ($currentArticle) {

              // if article is dirty or there are no versions, attempt to create one using firebase
              if (articleIsDirty || $currentArticle.$versions().length < 1) {

                // we do have firebase, so use firebase
                $currentArticle.$createVersion(articleData)
                  .then(function (versionData) {
                    // create occurred, resolve it with new version data
                    createDefer.resolve(versionData);
                  })
                  .catch(function () {
                    // create didn't occur, reject promise
                    createDefer.reject();
                  });

              } else {

                // article is not dirty, reject create
                createDefer.reject();

              }

            })
            .catch(function () {

              LocalStorageBackup.$versions().then(function (versions) {

                // if article is dirty or there are no versions, attempt to create one using local storage
                if (articleIsDirty || versions.length < 1) {

                  // create version with local storage
                  LocalStorageBackup.$create(articleData)
                    .then(function (versionData) {
                      // version was created, resolve create defer with version data
                      createDefer.resolve(versionData);
                    })
                    .catch(function (error) {
                      // version was not created, pass on error
                      createDefer.reject(error);
                    });

                } else {

                  // article is not dirty, reject create
                  createDefer.reject();

                }

              });

            });

          // return create promise
          return createPromise;

        },
        /**
         * Retrieve all versions either from firebase or local storage.
         * @return  list of version objects sorted by timestamp descending.
         */
        $all: function () {

          // set up deferred objects for all retrieval
          var allDefer = $q.defer(),
              allPromise = allDefer.promise;

          // check if we have firebase
          $firebaseAvailable
            .then(function ($currentArticle) {

              // we do have firebase, so use firebase
              $currentArticle.$versions().$loaded(function (versions) {
                allDefer.resolve(versions);
              });

            })
            .catch(function () {

              // we don't have firebase so use local storage
              LocalStorageBackup.$versions().then(function (versions) {
                allDefer.resolve(versions);
              }).catch(function (error) {
                allDefer.reject(error);
              });

            });

          // ensure versions are ordered by timestamp desc when they return
          return allPromise.then(function (versions) {
              return _.sortBy(versions, function (version) {
                return -version.timestamp;
              });
            });

        }

      };

    }
  ]);

angular.module('content.edit.versionBrowser', [

]);

'use strict';

angular.module('content.edit', [
  'bulbsCmsApp.settings',
  'content.edit.authors',
  'content.edit.body',
  'content.edit.controller',
  'content.edit.editorItem',
  'content.edit.linkBrowser',
  'content.edit.mainImage',
  'content.edit.section',
  'content.edit.tags',
  'content.edit.templateChooser',
  'content.edit.title',
  'content.edit.versionBrowser',
  'utils'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, UtilsProvider) {
      $routeProvider
        .when(UtilsProvider.path.join('/cms', 'app', 'edit', ':id/'), {
          templateUrl: UtilsProvider.path.join(
            COMPONENTS_URL,
            'content',
            'content-edit',
            'content-edit.html'
          ),
          controller: 'ContentEdit'
        });
    }]);

'use strict';

angular.module('content', [
  'content.edit'
]);

'use strict';

angular.module('customSearch.contentItem.directive', [
  'bulbsCmsApp.settings'
])
  .directive('customSearchContentItem', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        model: '=',
        controllerService: '=',
        onUpdate: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search-content-item/custom-search-content-item.html'
    };
  });

'use strict';

angular.module('customSearch.contentItem', [
  'customSearch.contentItem.directive'
]);

'use strict';

angular.module('customSearch.directive', [
  'bulbsCmsApp.settings',
  'customSearch.contentItem',
  'customSearch.service',
  'customSearch.simpleContentSearch',
  'customSearch.group'
])
  .directive('customSearch', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, CustomSearchService) {

        $scope.customSearchService = new CustomSearchService();

        $scope.resetFilters = function () {
          $scope.customSearchService.setPage(1);
          $scope.customSearchService.setQuery('');
          $scope.addedFilterOn = false;
          $scope.removedFilterOn = false;
        };

        $scope.$conditionalContentRetrieve = function () {
          if ($scope.addedFilterOn) {
            // included filter is on, use retrieval by included
            $scope.customSearchService.$filterContentByIncluded();
          } else if ($scope.removedFilterOn) {
            // excluded filter is on, use retrieval by excluded
            $scope.customSearchService.$filterContentByExcluded();
          } else {
            // no query entered, any request should go to page one
            $scope.customSearchService.$retrieveContent();
          }
        };

        $scope.$contentRetrieve = function () {
          $scope.customSearchService.$retrieveContent();
          $scope.onUpdate();
        };
      },
      link: function(scope, iElement, iAttrs, ngModelCtrl) {

        ngModelCtrl.$formatters.push(function (modelValue) {
          scope.customSearchService.data(modelValue);
          scope.customSearchService.$retrieveContent();
        });

      },
      require: 'ngModel',
      restrict: 'E',
      scope: {
        onUpdate: '&',
        queryParams: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search.html'
    };
  });

'use strict';

angular.module('customSearch.group.condition.directive', [
  'contentServices.factory',
  'customSearch.settings',
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'bulbsCmsApp.settings'
])
  .directive('customSearchGroupCondition', function (COMPONENTS_URL) {
    return {
      controller: function (_, $q, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          ContentFactory, CUSTOM_SEARCH_CONDITION_FIELDS, CUSTOM_SEARCH_CONDITION_TYPES) {

        $scope.conditionTypes = CUSTOM_SEARCH_CONDITION_TYPES;
        $scope.fieldTypes = CUSTOM_SEARCH_CONDITION_FIELDS;

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        $scope.data = $scope.controllerService.groupsConditionsGet($scope.groupIndex, $scope.conditionIndex);

        var $getItems = function () {
          return ContentFactory.all($scope.data.field)
            .getList({search: $scope.writables.searchTerm})
            .then(function (items) {
              var field = _.find($scope.fieldTypes, function (type) {
                return type.endpoint === $scope.data.field;
              });

              return _.map(items, function (item) {
                return {
                  name: item[field.value_structure.name],
                  value: item[field.value_structure.value]
                };
              });
            });
        };

        $scope.updateAutocomplete = function () {
          if ($scope.writables.searchTerm) {
            $getItems().then(function (results) {
              $scope.autocompleteItems = results;
            });
          }
        };

        $scope.delayClearAutocomplete = function () {
          _.delay(function () {
            $scope.clearAutocomplete();
            $scope.$digest();
          }, 200);
        };

        $scope.clearAutocomplete = function () {
          $scope.writables.searchTerm = '';
          $scope.autocompleteItems = [];
        };

        $scope.handleKeypress = function ($event) {
          if ($event.keyCode === 27) {
            // esc, close dropdown
            $scope.clearAutocomplete();
          } else {
            $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
          }
        };
      },
      restrict: 'E',
      scope: {
        controllerService: '=',
        groupIndex: '=',
        conditionIndex: '=',
        onUpdate: '&',
        remove: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search-group/custom-search-group-condition/custom-search-group-condition.html'
    };
  });

'use strict';

angular.module('customSearch.group.condition', [
  'customSearch.group.condition.directive'
]);

'use strict';

angular.module('customSearch.group.directive', [
  'bulbsCmsApp.settings',
  'customSearch.settings',
  'uuid4'
])
  .directive('customSearchGroup', function (COMPONENTS_URL) {
    return {
      controller: function ($scope, CUSTOM_SEARCH_TIME_PERIODS, uuid4) {
        $scope.data = $scope.controllerService.groupsGet($scope.groupIndex);
        $scope.timePeriods = CUSTOM_SEARCH_TIME_PERIODS;
        $scope.uuid = uuid4.generate();

        $scope.$update = function () {
          $scope.controllerService.$groupsUpdateResultCountFor($scope.groupIndex).then(function () {
            $scope.onUpdate();
          });
        };

        $scope.controllerService.$groupsUpdateResultCountFor($scope.groupIndex);
      },
      restrict: 'E',
      scope: {
        controllerService: '=',
        groupIndex: '=',
        remove: '&',
        onUpdate: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search-group/custom-search-group.html'
    };
  });

'use strict';

angular.module('customSearch.group', [
  'customSearch.group.directive',
  'customSearch.group.condition'
]);

'use strict';

angular.module('customSearch.service', [
  'customSearch.settings',
  'apiServices.customSearch.factory'
])
  .factory('CustomSearchService', function (_, CustomSearch, CUSTOM_SEARCH_CONDITION_FIELDS,
      CUSTOM_SEARCH_CONDITION_TYPES, CUSTOM_SEARCH_REQUEST_CAP_MS, CUSTOM_SEARCH_TIME_PERIODS) {

    var defaultData = {
      groups: [],
      includedIds: [],
      excludedIds: [],
      pinnedIds: []
    };

    /**
     * Create custom search service.
     *
     * @returns service wrapper around given endpoint.
     */
    var CustomSearchService = function (data) {

      this.data(data);

      this.$page = 1;
      this.$query = '';

      this.content = {};
    };

    CustomSearchService.prototype.data = function (data) {

      if (_.isUndefined(data)) {
        this._data = defaultData;
      } else {
        this._data = _.defaults(data, defaultData);
      }

      return this._data;
    };

    CustomSearchService.prototype._$getContent = _.debounce(function (queryData) {
      var self = this;
      return CustomSearch.$retrieveContent(queryData)
        .then(function (data) {
          self.content = data;
        });
    }, CUSTOM_SEARCH_REQUEST_CAP_MS);

    CustomSearchService.prototype.$filterContentByIncluded = function () {
      var contentQuery = {
        includedIds: this._data.includedIds,
        page: this.$page,
        query: this.$query
      };
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$filterContentByExcluded = function () {
      var contentQuery = {
        includedIds: this._data.excludedIds,
        page: this.$page,
        query: this.$query
      };
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$retrieveContent = function () {
      var contentQuery = _.assign({
        page: this.$page,
        query: this.$query,
        preview: true
      }, this._data);
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$groupsUpdateResultCountFor = function (index) {
      var self = this;
      return (function (index) {
        return CustomSearch.$retrieveGroupCount(self._data.groups[index])
          .then(function (count) {
            self._data.groups[index].$result_count = count;
          });
      })(index);
    };

    CustomSearchService.prototype.groupsResultCountGet = function (index) {
      return this._data.groups[index].$result_count || 0;
    };

    CustomSearchService.prototype.groupsList = function () {
      return this._data.groups;
    };

    CustomSearchService.prototype.groupsAdd = function (data) {
      if (_.isUndefined(data)) {
        data = {};
      }

      data = _.defaults(data, {
        conditions: [],
        time: null,
        $result_count: 0
      });

      this._data.groups.push(data);
      return data;
    };

    CustomSearchService.prototype.groupsGet = function (index) {
      return this._data.groups[index];
    };

    CustomSearchService.prototype.groupsRemove = function (index) {
      return this._data.groups.splice(index, 1).length > 0;
    };

    CustomSearchService.prototype.groupsClear = function () {
      this._data.groups = [];
    };

    CustomSearchService.prototype.groupsConditionsAdd = function (groupIndex, data) {
      if (_.isUndefined(data)) {
        data = {};
      }

      data = _.defaults(data, {
        field: CUSTOM_SEARCH_CONDITION_FIELDS[0].endpoint,
        type: CUSTOM_SEARCH_CONDITION_TYPES[0].value,
        values: []
      });

      this._data.groups[groupIndex].conditions.push(data);
      return data;
    };

    CustomSearchService.prototype.groupsConditionsGet = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex];
    };

    CustomSearchService.prototype.groupsConditionsList = function (groupIndex) {
      return this._data.groups[groupIndex].conditions;
    };

    CustomSearchService.prototype.groupsConditionsRemove = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions.splice(conditionIndex, 1).length > 0;
    };

    CustomSearchService.prototype.groupsTimePeriodSet = function (groupIndex) {
      var value = CUSTOM_SEARCH_TIME_PERIODS[0].value;
      this._data.groups[groupIndex].time = value;
      return value;
    };

    CustomSearchService.prototype.groupsTimePeriodGet = function (groupIndex) {
      return this._data.groups[groupIndex].time || null;
    };

    CustomSearchService.prototype.groupsTimePeriodRemove = function (groupIndex) {
      this._data.groups[groupIndex].time = null;
    };

    CustomSearchService.prototype.groupsConditionsValuesAdd = function (groupIndex, conditionIndex, value) {
      var values = this._data.groups[groupIndex].conditions[conditionIndex].values;
      var matches = _.find(values, function (existingValue) {
        return existingValue.name === value.name && existingValue.value === value.value;
      });

      if (!matches) {
        values.push(value);
      }
    };

    CustomSearchService.prototype.groupsConditionsValuesClear = function (groupIndex, conditionIndex) {
      this._data.groups[groupIndex].conditions[conditionIndex].values = [];
    };

    CustomSearchService.prototype.groupsConditionsValuesList = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex].values;
    };

    CustomSearchService.prototype.groupsConditionsValuesRemove = function (groupIndex, conditionIndex, valueIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex].values.splice(valueIndex, 1).length > 0;
    };

    CustomSearchService.prototype.includesList = function () {
      return this._data.includedIds;
    };

    CustomSearchService.prototype.includesAdd = function (id) {
      // add id, ensure uniqueness
      this._data.includedIds.push(id);
      this._data.includedIds = _.uniq(this._data.includedIds);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.includesRemove = function (id) {
      this._data.includedIds = _.without(this._data.includedIds, id);
    };

    CustomSearchService.prototype.includesHas = function (id) {
      return _.includes(this._data.includedIds, id);
    };

    CustomSearchService.prototype.excludesList = function () {
      return this._data.excludedIds;
    };

    CustomSearchService.prototype.excludesAdd = function (id) {
      // exclude id, ensure unqiueness
      this._data.excludedIds.push(id);
      this._data.excludedIds = _.uniq(this._data.excludedIds);

      // remove from include list and pinned list
      this.includesRemove(id);
      this.pinsRemove(id);
    };

    CustomSearchService.prototype.excludesRemove = function (id) {
      this._data.excludedIds = _.without(this._data.excludedIds, id);
    };

    CustomSearchService.prototype.excludesHas = function (id) {
      return _.includes(this._data.excludedIds, id);
    };

    CustomSearchService.prototype.pinsList = function () {
      return this._data.pinnedIds;
    };

    CustomSearchService.prototype.pinsAdd = function (id) {
      // pin id, ensure unqiueness
      this._data.pinnedIds.push(id);
      this._data.pinnedIds = _.uniq(this._data.pinnedIds);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.pinsRemove = function (id) {
      this._data.pinnedIds = _.without(this._data.pinnedIds, id);
    };

    CustomSearchService.prototype.pinsHas = function (id) {
      return _.includes(this._data.pinnedIds, id);
    };

    CustomSearchService.prototype.getPage = function () {
      return this.$page;
    };

    CustomSearchService.prototype.setPage = function (page) {
      this.$page = page;
    };

    CustomSearchService.prototype.getQuery = function () {
      return this.$query;
    };

    CustomSearchService.prototype.setQuery = function (query) {
      this.$query = query;
    };

    return CustomSearchService;
  });

'use strict';

angular.module('customSearch.settings', [])
  .value('CUSTOM_SEARCH_CONDITION_FIELDS', [{
    name: 'Content Type',
    endpoint: 'content-type',
    value_structure: {
      name: 'name',
      value: 'doctype'
    }
  }, {
    name: 'Feature Type',
    endpoint: 'feature-type',
    value_structure: {
      name: 'name',
      value: 'slug'
    }
  }, {
    name: 'Tag',
    endpoint: 'tag',
    value_structure: {
      name: 'name',
      value: 'slug'
    }
  }])
  .value('CUSTOM_SEARCH_CONDITION_TYPES', [{
    name: 'is any of',
    value: 'any'
  }, {
    name: 'is all of',
    value: 'all'
  }, {
    name: 'is none of',
    value: 'none'
  }])
  .value('CUSTOM_SEARCH_TIME_PERIODS', [{
    name: 'Past Day',
    value: '1 day'
  }, {
    name: 'Past Week',
    value: '1 week'
  }])
  .value('CUSTOM_SEARCH_REQUEST_CAP_MS', 150);

'use strict';

angular.module('customSearch.simpleContentSearch.directive', [
  'BulbsAutocomplete',
  'BulbsAutocomplete.suggest',
  'bulbsCmsApp.settings'
])
  .directive('customSearchSimpleContentSearch', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, BULBS_AUTOCOMPLETE_EVENT_KEYPRESS,
          ContentFactory) {

        $scope.writables = {
          searchTerm: ''
        };

        $scope.autocompleteItems = [];

        var $getItems = function () {
          var queryParams = $scope.queryParams();
          var searchParams = {search: $scope.writables.searchTerm};
          angular.extend(searchParams, queryParams);
          return ContentFactory.all('content')
            .getList(searchParams)
            .then(function (results) {
              return _.chain(results)
                .take(10)
                .map(function (item) {
                  return {
                    name: 'ID: ' + item.id + ' | ' + item.title,
                    value: item.id
                  };
                })
                .value();
              });
        };

        $scope.updateAutocomplete = function () {
          if ($scope.writables.searchTerm) {
            $getItems().then(function (results) {
              $scope.autocompleteItems = results;
            });
          }
        };

        $scope.delayClearAutocomplete = function () {
          _.delay(function () {
            $scope.clearAutocomplete();
            $scope.$digest();
          }, 200);
        };

        $scope.clearAutocomplete = function () {
          $scope.writables.searchTerm = '';
          $scope.autocompleteItems = [];
        };

        $scope.handleKeypress = function ($event) {
          if ($event.keyCode === 27) {
            // esc, close dropdown
            $scope.clearAutocomplete();
          } else {
            $scope.$broadcast(BULBS_AUTOCOMPLETE_EVENT_KEYPRESS, $event);
          }
        };
      },
      restrict: 'E',
      scope: {
        queryParams: '&',
        onSelect: '&'
      },
      templateUrl: COMPONENTS_URL + 'custom-search/custom-search-simple-content-search/custom-search-simple-content-search.html'
    };
  });

'use strict';

angular.module('customSearch.simpleContentSearch', [
  'customSearch.simpleContentSearch.directive'
]);

'use strict';

angular.module('customSearch', [
  'bulbsCmsApp.settings',
  'customSearch.directive'
]);

'use strict';

angular.module('content.video', [
  'content',
  'videoSearch'
])
  .directive('contentVideo', [
    'COMPONENTS_URL',
    function (COMPONENTS_URL) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: COMPONENTS_URL + 'edit-pages/video/video.html'
      };
    }
  ]);

'use strict';

angular.module('EditorsPick', [
  'customSearch'
])
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/sod/', {
        controller: function ($scope, $window) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | SoD';

          $scope.$watch('queryData', function () { console.log(arguments); });

          $scope.queryData = {};
          $scope.updateQueryData = function () {
            $scope.queryData = {
              groups: [{
                conditions: [{
                  field: 'content-type',
                  type: 'all',
                  values: [{
                    name: 'for display',
                    value: 'actually-use-this-value-123'
                  }]
                }],
                time: '1 day'
              }],
              included_ids: [1],
              excluded_ids: [2],
              pinned_ids: [3],
              page: 1,
  	          query: 'query balh blah blahb'
            };
          };

          $scope.updateConditionData = function () {
            $scope.queryData.groups[0].conditions = [{
              field: 'content-type',
              type: 'all',
              values: [{
                name: 'ANOTHER THIGN',
                value: 'actually-use-this-value-123'
              }]
            }];
          };

        },
        templateUrl: COMPONENTS_URL + 'editors-pick/editors-pick.html',
        reloadOnSearch: false
      });
  });

'use strict';

angular.module('filterListWidget.directive', [
  'bulbsCmsApp.settings',
  'lodash',
  'utils'
])
  .directive('filterListWidget', [
    '_', '$http', '$location', '$timeout', '$', 'COMPONENTS_URL', 'Utils',
    function (_, $http, $location, $timeout, $, COMPONENTS_URL, Utils) {
      return {
        restrict: 'E',
        scope: {
          filters: '='
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'filter-list-widget',
          'filter-list-widget.html'
        ),
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
              if ($element.find('.selected').length > 0) {
                // To trigger the click we need to first break out of the
                // current $apply() cycle. Hence the $timeout()
                $timeout(function () {
                  angular.element('.selected > a').triggerHandler('click');
                }, 0);
              } else {
                scope.addFilter('search', $input.val());
              }
            }
          });

          scope.search = function () {
            scope.addFilter('search', scope.filterInputValue);
          };

          scope.clearSearch = function () {
            scope.filterInputValue = '';
          };

          scope.clearFilters = function () {
            scope.filters = {};
            scope.filterInputValue = '';
            return applyFilterChange({});
          };

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
              if (!filterObject[type]) {
                filterObject[type] = [];
              }
              if (typeof(filterObject[type]) === 'string') {
                filterObject[type] = [filterObject[type]];
              }
              if (!_.contains(filterObject[type], newFilterValue)) {
                // this value is not already in
                filterObject[type].push(newFilterValue);
              }
            }
            return applyFilterChange(filterObject);
          };

          scope.deleteFilter = function (key) {
            var filterObject = $location.search();
            var toDelete = scope.filters[key];
            if (typeof(filterObject[toDelete.type]) === 'string') {
              filterObject[toDelete.type] = [filterObject[toDelete.type]];
            }
            var toSplice;
            for (var i in filterObject[toDelete.type]) {
              if (filterObject[toDelete.type][i] === toDelete.query) {
                toSplice = i;
                break;
              }
            }
            filterObject[toDelete.type].splice(i, 1);
            filterObject.search = $input.val();
            delete scope.filters[key];
            return applyFilterChange(filterObject);
          };

          function applyFilterChange(filterObject) {
            filterObject.page = 1;
            $location.search(filterObject);
            scope.autocompleteArray = [];
            $input.trigger('blur');
          }

          function getFilterObjects() {
            var search = $location.search();
            scope.filters = {};
            if (typeof(search) === 'undefined') { console.log('undefined'); return; }
            //TODO: this sucks
            var filterParamsToTypes = {'authors': 'author', 'tags': 'tag', 'feature_types': 'feature_type'};
            for (var filterParam in filterParamsToTypes) {
              var filterType = filterParamsToTypes[filterParam];
              if (typeof(search[filterParam]) === 'string') { search[filterParam] = [search[filterParam]]; }
              for (var i in search[filterParam]) {
                var value = search[filterParam][i];
                scope.filters[filterType + value] = {'query': value, 'type': filterParam};
                getQueryToLabelMappings(filterType, value);
              }
            }
            if (search.search) {
              scope.filterInputValue = search.search;
            }
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
    }
  ]);

'use strict';

angular.module('filterListWidget', [
  'filterListWidget.directive'
]);
'use strict';

angular.module('filterWidget.directive', [
  'bulbsCmsApp.settings',
  'contentServices.factory',
  'contentServices.listService'
])
  .directive('filterWidget', function (_, $location, $timeout, $, ContentListService,
      ContentFactory, COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'filter-widget/filter-widget.html',
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

          ContentFactory.all('things')
            .getList({
              type: [
                'tag',
                'feature_type',
                'author'
              ],
              q: search
            })
            .then(function (data) {
              scope.autocompleteArray = data;
            });
        }

        $input.on('keyup', function (e) {
          if (e.keyCode === 38) { arrowSelect('up'); }//up
          if (e.keyCode === 40) { arrowSelect('down'); } //down
          if (e.keyCode === 13) { //enter
            if ($element.find('.selected').length > 0) {
              // To trigger the click we need to first break out of the
              // current $apply() cycle. Hence the $timeout()
              $timeout(function () {
                angular.element('.selected > a').triggerHandler('click');
              }, 0);
            } else {
              scope.addFilter('search', $input.val());
            }
          }
        });

        scope.search = function () {
          scope.addFilter('search', scope.filterInputValue);
        };

        scope.clearSearch = function () {
          scope.filterInputValue = '';
        };

        scope.clearFilters = function () {
          scope.filterObjects = {};
          scope.filterInputValue = '';
          return applyFilterChange({});
        };

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
            if (!filterObject[type]) {
              filterObject[type] = [];
            }
            if (typeof(filterObject[type]) === 'string') {
              filterObject[type] = [filterObject[type]];
            }
            if (!_.contains(filterObject[type], newFilterValue)) {
              // this value is not already in
              filterObject[type].push(newFilterValue);
            }
          }
          return applyFilterChange(filterObject);
        };

        scope.deleteFilter = function (key) {
          var filterObject = $location.search();
          var toDelete = scope.filterObjects[key];
          if (typeof(filterObject[toDelete.type]) === 'string') {
            filterObject[toDelete.type] = [filterObject[toDelete.type]];
          }
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
          return applyFilterChange(filterObject);
        };

        function applyFilterChange(filterObject) {
          filterObject.page = 1;
          $location.search(filterObject);
          scope.autocompleteArray = [];
          $input.trigger('blur');

          return ContentListService.$updateContent(filterObject);
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
          if (search.search) {
            scope.filterInputValue = search.search;
          }
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

          if (query in scope.queryToLabelMappings) {
            return;
          }

          ContentFactory.all('things')
            .getList({
              type: 'tag',
              q: query
            })
            .then(function (data) {
              for (var i = 0; i < data.length; i++) {
                scope.queryToLabelMappings[data[i].value] = data[i].name;
              }
            });
        }
      }
    };
  });

'use strict';

angular.module('filterWidget', [
  'filterWidget.directive'
]);

'use strict';

angular.module('genericAjaxButton.controller', [])
  .controller('GenericAjaxButtonController', function ($scope) {
    $scope.STATES = {
      DONE: 'done',
      PROGRESS: 'in-progress',
      ERROR: 'error'
    };
    $scope.doClick = function () {
      $scope.state = $scope.STATES.PROGRESS;
      $scope.clickFunction()
        .then(function () {
          $scope.state = $scope.STATES.DONE;
        })
        .catch(function () {
          $scope.state = $scope.STATES.ERROR;
        });
    };
  });

'use strict';

/**
 * Highly customizable four state ajax button. Useful for buttons which require
 *  different displays for disabled/action/progress/complete states.
 */
angular.module('genericAjaxButton.directive', [
  'bulbsCmsApp.settings',
  'genericAjaxButton.controller'
])
  .directive('genericAjaxButton', function (COMPONENTS_URL) {
    return {
      controller: 'GenericAjaxButtonController',
      restrict: 'E',
      scope: {
        disableWhen: '&',
        clickFunction: '=',
        cssBtnClassComplete: '@',
        cssBtnClassError: '@',
        cssBtnClasses: '@',
        cssBtnClassProgress: '@',
        cssIconComplete: '@',
        textError: '@',
        textProgress: '@',
        textComplete: '@'
      },
      templateUrl: COMPONENTS_URL + 'generic-ajax-button/generic-ajax-button.html'
    };
  });

'use strict';

angular.module('genericAjaxButton', [
  'genericAjaxButton.directive'
]);

'use strict';

angular.module('saveButton.directive', [
  'genericAjaxButton'
])
  .directive('saveButton', function (COMPONENTS_URL) {
    return {
      controller: 'GenericAjaxButtonController',
      link: {
        pre: function (scope) {
          scope.cssIconComplete = 'fa-floppy-o';
          scope.textProgress = 'Saving...';
          scope.textComplete = 'Save';
        }
      },
      restrict: 'E',
      scope: {
        disableWhen: '&',
        clickFunction: '=',
      },
      templateUrl: COMPONENTS_URL + 'generic-ajax-button/generic-ajax-button.html'
    };
  });

'use strict';

angular.module('promotedContentArticle.directive', [
  'bulbsCmsApp.settings'
])
  .directive('promotedContentArticle', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-article/promoted-content-article.html'
    };
  });

'use strict';

angular.module('promotedContentArticle', [
  'promotedContentArticle.directive'
]);

'use strict';

angular.module('promotedContentList.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service',
  'promotedContentArticle',
  'promotedContentSave',
  'ui.sortable'
])
  .directive('promotedContentList', function ($, COMPONENTS_URL) {
    return {
      controller: function ($scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();

        $scope.moveUp = function (index) {
          PromotedContentService.moveContentUp(index);
        };

        $scope.moveDown = function (index) {
          PromotedContentService.moveContentDn(index);
        };

        $scope.remove = function (article) {
          PromotedContentService.$removeContentFromPZone(article.id);
        };

        $scope.completeAction = function (index) {
          PromotedContentService.$completeContentAction(index);
        };

        $scope.stopAction = function () {
          PromotedContentService.stopContentAction();
        };

        $scope.markDirty = function () {
          PromotedContentService.markDirtySelectedPZone();
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      link: function (scope, element, attr) {

        scope.sortableOptions = {
          beforeStop: function (e, ui) {
            ui.helper.css('margin-top', 0);
            ui.item.parent().removeClass('ui-sortable-dragging');
          },
          cancel: '.ui-sortable-unsortable',
          change: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          containment: 'promoted-content-list',
          distance: 3,
          opacity: 0.75,
          placeholder: 'dropzone',
          start: function (e, ui) {
            ui.item.parent().addClass('ui-sortable-dragging');
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          stop: function () {
            scope.markDirty();
          }
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-list/promoted-content-list.html'
    };
  });

'use strict';

angular.module('promotedContentList', [
  'promotedContentList.directive'
]);

'use strict';

angular.module('promotedContentOperationsList.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentOperationsList', function (_, moment, COMPONENTS_URL) {
    return {
      controller: function (moment, $scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();
        $scope.scheduleDateFrom = moment();
        $scope.scheduleDateTo = moment().add(3, 'days');
        $scope.deleteStatus = {
          message: '',
          isError: false
        };

        PromotedContentService.$ready()
          .then(function () {
            $scope.aggregatedOperations = $scope.pzoneData.operations.concat($scope.pzoneData.unsavedOperations);
          });

        $scope.removeOperation = function (operation) {
          PromotedContentService.$removeOperation(operation.id)
            .then(function () {
              $scope.deleteStatus = {
                message: 'Operation successfully removed!',
                isError: false
              };
            })
            .catch(function (err) {
              $scope.deleteStatus = {
                message: err,
                isError: true
              };
            });
        };

        $scope.clearDeleteStatus = function () {
          $scope.deleteStatus.message = '';
        };

        $scope.setPreviewTime = function (time) {
          // set preview time to time plus a minute so that all operations occuring in that
          //  minute can be previewed
          PromotedContentService.setPreviewTime(time.add(1, 'minute'));
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };

        $scope.operationsStale = function () {
          return PromotedContentService.isPZoneOperationsStale();
        };

        $scope.refreshingOperations = false;
        $scope.refreshOperations = function () {

          if (!$scope.refreshingOperations) {
            $scope.refreshingOperations = true;
            PromotedContentService.$refreshOperations({
              from: $scope.scheduleDateFrom.toISOString(),
              to: $scope.scheduleDateTo.toISOString()
            })
              .finally(function () {
                $scope.refreshingOperations = false;
              });
          }
        };
      },
      link: function (scope, element, attr) {

        var operationTime = function (operation) {
          var compTime;
          if (operation.whenAsMoment) {
            // has a time, use that
            compTime = operation.whenAsMoment;
          } else if (scope.pzoneData.previewTime){
            // has no time, but preview time is set, use that
            compTime = scope.pzoneData.previewTime;
          } else {
            // this is an immediate operation
            compTime = moment();
          }
          return compTime;
        };

        scope.aggregatedOperations = {};
        scope.groupDateFormat = 'M/D/YY @ h:mma';
        var aggregator = function () {
          var tempAggregate = scope.pzoneData.operations.concat(scope.pzoneData.unsavedOperations);

          scope.aggregatedOperations = _.chain(tempAggregate)
            .sortBy(operationTime)
            .groupBy(function (operation) {
              return operationTime(operation).format(scope.groupDateFormat);
            })
            .pairs()
            .map(function (pair) {
              return [moment(pair[0], scope.groupDateFormat), pair[1]];
            })
            .sortBy(function (pair) {
              return pair[0];
            })
            .value();
        };

        scope.$watchCollection('pzoneData.operations', aggregator);
        scope.$watchCollection('pzoneData.unsavedOperations', aggregator);

      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-operations-list/promoted-content-operations-list.html'
    };
  });

'use strict';

angular.module('promotedContentOperationsList', [
  'promotedContentOperationsList.directive'
]);

'use strict';

angular.module('promotedContentPzoneSelect.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentPzoneSelect', function (COMPONENTS_URL) {
    return {
      controller: function ($scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();
        $scope.selectedPZoneName = '';

        PromotedContentService.$ready()
          .then(function () {
            $scope.selectedPZoneName = $scope.pzoneData.selectedPZone.name;
          });

        $scope.changePZone = function (name) {
          (function (name) {
            PromotedContentService.$refreshPZones()
              .then(function () {
                PromotedContentService.$selectPZone(name);
              });
          })(name);
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-pzone-select/promoted-content-pzone-select.html'
    };
  });

'use strict';

angular.module('promotedContentPzoneSelect', [
  'promotedContentPzoneSelect.directive'
]);

'use strict';

angular.module('promotedContentSave.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentSave', function (COMPONENTS_URL) {
    return {
      controller: function ($scope, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();

        $scope.savePZone = function () {
          PromotedContentService.$saveSelectedPZone();
        };

        $scope.clearOperations = function () {
          // clear any unsaved operations
          PromotedContentService.clearUnsavedOperations();

          // refresh selected pzone
          PromotedContentService.$refreshSelectedPZone($scope.pzoneData.previewTime);
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-save/promoted-content-save.html'
    };
  });

'use strict';

angular.module('promotedContentSave', [
  'promotedContentSave.directive'
]);

'use strict';

angular.module('promotedContentSearch.directive', [
  'bulbsCmsApp.settings',
  'statusFilter',
  'filterWidget',
  'promotedContent.service',
  'promotedContentArticle'
])
  .directive('promotedContentSearch', function (COMPONENTS_URL) {
    return {
      controller: function (_, moment, $scope, $location, PromotedContentService) {

        $scope.pzoneData = PromotedContentService.getData();
        $scope.pageNumber = $location.search().page || '1';

        $scope.goToPage = function () {
          PromotedContentService.$refreshAllContent({page: $scope.pageNumber}, true);
        };

        /**
        * Check if an content is enabled. Actions are allowed if preview time is
        *  set to immediate and the content is already published, or if a preview
        *  time is set into the future and the content will be published before that.
        *  In either case, content is only draggable if it is not already listed.
        *
        * @param {object} content - content to check if enabled.
        * @returns {Boolean} true if content is enabled, false otherwise.
        */
        $scope.contentIsEnabled = function (content) {
          var notAlreadyInList =
            ($scope.pzoneData.selectedPZone &&
            _.isUndefined(_.find($scope.pzoneData.selectedPZone.content, {id: content.id})));
          var immediateDraggable =
            ($scope.pzoneData.previewTime === null &&
              moment().isAfter(content.published));
          var futureDraggable =
            ($scope.pzoneData.previewTime !== null &&
              moment().isBefore($scope.pzoneData.previewTime) &&
              $scope.pzoneData.previewTime.isAfter(content.published));

          return notAlreadyInList && (immediateDraggable || futureDraggable);
        };

        $scope.beginInsert = function (article) {
          PromotedContentService.beginContentInsert(article);
        };

        $scope.beginReplace = function (article) {
          PromotedContentService.beginContentReplace(article);
        };

        $scope.stopAction = function () {
          PromotedContentService.stopContentAction();
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      link: function (scope, element, attr) {

        scope.tools = null;
        scope.openToolsFor = function (article) {
          var doOpen = false;
          if (!scope.disableControls()) {
            scope.tools = article.id;
            doOpen = true;
          }
          return doOpen;
        };

        scope.closeTools = function () {
          scope.tools = null;
          return true;
        };

        scope.toolsOpenFor = function (article) {
          return scope.tools === article.id;
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-search/promoted-content-search.html'
    };
  });

'use strict';

angular.module('promotedContentSearch', [
  'promotedContentSearch.directive'
]);

'use strict';

/**
 * Main service for promoted content page. Handles all data, all data modifications
 *  for this page should be done through this service.
 */
angular.module('promotedContent.service', [
  'contentServices',
  'moment',
  'restangular'
])
  .service('PromotedContentService', function ($, _, moment, $q, Restangular,
      ContentFactory, ContentListService) {

    var PromotedContentService = this;
    PromotedContentService._serviceData = {
      allContent: ContentListService.getData(),
      actionContent: null,
      action: null,
      pzones: [],
      unsavedOperations: [],
      operations: [],
      selectedPZone: null,
      previewTime: null
    };
    var _data = PromotedContentService._serviceData;

    // promise that resolves once this service is done setting up
    var setupDefer = $q.defer();

    var readableOperationTypes = {
      INSERT: 'INSERT',
      DELETE: 'DELETE',
      REPLACE: 'REPLACE'
    };
    PromotedContentService.readableOperationTypes = readableOperationTypes;

    var operationTypeToReadable = {
      'promotion_insertoperation': readableOperationTypes.INSERT,
      'promotion_deleteoperation': readableOperationTypes.DELETE,
      'promotion_replaceoperation': readableOperationTypes.REPLACE
    };
    var readableToOperationType =
      _.reduce(operationTypeToReadable, function (result, val, key) {
        result[val] = key;
        return result;
      }, {});

    // flag to check if there's a pzone data refresh pending
    var pzoneRefreshPending = false;
    // flag to check if operations data is stale
    var pzoneOperationsStale = true;

    /**
     * Getter for refresh pending flag. Use this to check if a pzone is in the
     *  process of loading its data, to prevent editing.
     *
     * @returns {Boolean} true if pzone data is refreshing, false otherwise.
     */
    PromotedContentService.isPZoneRefreshPending = function () {
      return pzoneRefreshPending;
    };

    /**
     * Getter for pzone operations stale flag. Use this to check if operations list
     *  is out of sync and needs to be refreshed before data is accurate.
     *
     * @returns {Boolean} ture if pzone operations are stale, false otherwise.
     */
    PromotedContentService.isPZoneOperationsStale = function () {
      return pzoneOperationsStale;
    };

    /**
     * Refresh pzone data, given the following parameters:
     *
     * @param {Object} filters - filter zones with these parameters.
     * @returns {Promise} resolves with pzone data, or rejects with an error message.
     */
    PromotedContentService.$refreshPZones = function (filters) {
      var deferred = $q.defer();

      // start a new request if one isn't already pending
      if (!pzoneRefreshPending) {
        pzoneRefreshPending = true;

        return ContentFactory.all('pzone').getList(filters)
          .then(function (data) {
            _data.pzones = data;
            // mark everything as saved
            _.each(_data.pzones, function (pzone) {
              pzone.saved = true;
            });

            deferred.resolve();

            // resolve with pzones
            return _data.pzones;
          })
          .catch(function (err) {
            deferred.reject();
            return err;
          })
          .finally(function () {
            pzoneRefreshPending = false;
          });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    };

    /**
     * Mark selected pzone as dirty.
     */
    PromotedContentService.markDirtySelectedPZone = function () {
      delete _data.selectedPZone.saved;
    };

    /**
     * Mark selected pzone as saved (not dirty).
     */
    PromotedContentService.markSavedSelectedPZone = function () {
      _data.selectedPZone.saved = true;
    };

    /**
     * Make the list of operations stale, meaning the user will have to manually
     *  refresh it.
     */
    PromotedContentService.makeOperationsStale = function () {
      _data.operations = [];
      pzoneOperationsStale = true;
    };

    /**
     * Save the currently selected pzone by posting all operations at currently
     *  selected time. If no time is selected, pzone will be immediately updated.
     *
     * @returns {Promise} resolves with selected pzone once saving is done.
     */
    PromotedContentService.$saveSelectedPZone = function () {
      var defer = $q.defer();

      if (_data.previewTime && _data.previewTime.isAfter(moment())) {
        PromotedContentService.makeOperationsStale();

        // grab operations out of unsaved operations and post them into operations list
        _.each(_data.unsavedOperations, function (operation) {
          // use preview time, or send null if immediate
          operation.when = _data.previewTime ? _data.previewTime.toISOString() : null;
          // remove client side client_id
          delete operation.client_id;
        });

        // post all operations as an array
        _data.selectedPZone.all('operations').post(_data.unsavedOperations)
          .then(function () {
            defer.resolve(_data.selectedPZone);
          });

        // clear whatever unsaved operations we have, shouldn't be any in this case
        PromotedContentService.clearUnsavedOperations();

      } else if (!_data.previewTime){
        // clear whatever unsaved operations we have, shouldn't be an in this case
        PromotedContentService.clearUnsavedOperations();

        PromotedContentService.makeOperationsStale();

        // no preview time is set, post pzone immediately
        _data.selectedPZone.put()
          .then(function () {
            defer.resolve(_data.selectedPZone);
          })
          .catch(function (err) {
            defer.reject(err);
          });
      } else {
        // preview time is in the past, error out
        defer.reject('Cannot save operations in the past.');
      }

      return defer.promise;
    };

    /**
     * Refresh content data using ContentListService.
     *
     * @param {...object} var_args - arguments taken by [ContentListService.$updateContent]{@link ContentListService#$updateContent}.
     * @returns {Promise} resolves based on [ContentListService.$updateContent]{@link ContentListService#$updateContent}.
     */
    PromotedContentService.$refreshAllContent = function () {
      return ContentListService.$updateContent.apply(ContentListService, arguments);
    };

    /**
     * Create a new operation. Note, this will not be saved until user clicks
     *  save, at which point the new item should be posted to the operations list.
     *  If preview time is set to immediate, no operation will be created, and this
     *  function will resolve with nothing.
     *
     * @param {Object} props - properties of new operation.
     * @returns {Promise} resolves with new operation or nothing, or rejects with an error message.
     */
    PromotedContentService.$addOperation = function (props) {
      var defer = $q.defer();

      if (!PromotedContentService.isPreviewTimeImmediate()) {
        if (!PromotedContentService.isPreviewTimePast()) {
          var lastId = _.max(_data.unsavedOperations, 'client_id').client_id;
          var nextId = lastId ? lastId + 1 : 0;
          var allProps = _.assign({
            client_id: nextId,
            type_name: readableToOperationType[props.cleanType] || '',
            pzone: _data.selectedPZone.id,
            applied: false,
            content: null,
            content_title: '',
            index: null
          }, props);

          var operation = Restangular.restangularizeElement(
            _data.selectedPZone.all('operations'), allProps
          );
          _data.unsavedOperations.push(operation);

          defer.resolve(operation);
        } else {
          // we are looking at the past, we cannot add new operations
          defer.reject('Cannot add operations in the past.');
        }
      } else {
        // preview time is immediate, don't add an operation
        defer.resolve();
      }

      return defer.promise;
    };

    /**
     * Remove an operation from operation list. Only saved, future operations are removable.
     *
     * @param {Number} id - id of operation to remove.
     * @returns {Promise} promise that resolves with nothing, or rejects with an
     *  error message.
     */
    PromotedContentService.$removeOperation = function (id) {
      var defer = $q.defer();

      // delete this from the saved operations list
      var index = _.findIndex(_data.operations, {id: id});
      var operation = _data.operations[index];
      if (operation) {
        if (operation.whenAsMoment.isAfter(moment())) {
          operation.remove()
            .then(function () {
              // remove operation and resolve
              _data.operations.splice(index, 1);
              defer.resolve();
            })
            .catch(function (err) {
              if (err.status === 404) {
                defer.reject('Cannot find operation to delete.');
              } else {
                defer.reject(err);
              }
            });
        } else {
          defer.reject('Cannot delete an operation in the past.');
        }
      } else {
        defer.reject('Could not find saved operation with id ' + id + ' to delete.');
      }

      return defer.promise;
    };

    /**
     * Clear unsaved operations list.
     */
    PromotedContentService.clearUnsavedOperations = function () {
      _data.unsavedOperations = [];
      PromotedContentService.markSavedSelectedPZone();
    };

    /**
     * Refresh operations data for selected pzone. Each operation returned will
     *  contain an additional property called cleanType that is the clean,
     *  displayable representation of the operation type.
     *
     * GOD DAMN IT RACE CONDITIONS NOTE: To avoid race conditions, only call
     *  this function as a result of user interaction.
     *
     * @param {object} params - query parameters to append to request.
     * @returns {Promise} resolves with operation data, or rejects with an error message.
     */
    PromotedContentService.$refreshOperations = function (params) {
      return _data.selectedPZone.getList('operations', params)
        .then(function (data) {

          _data.operations = data;

          _.each(_data.operations, function (operation) {
            operation.cleanType = operationTypeToReadable[operation.type_name];
            operation.whenAsMoment = moment(operation.when);
          });

          pzoneOperationsStale = false;

          return _data.operations;
        })
        .catch(function (err) {
          return err;
        });
    };

    /**
     * Select a pzone with the given name. Will refresh operations list.
     *
     * @param {string} [name] - name of pzone to select, selects first pzone if
     *  name not provided.
     * @returns {Promise} resolves based on $refreshSelectedPZone Promise.
     */
    PromotedContentService.$selectPZone = function (name) {
      // select pzone to edit
      _data.selectedPZone = _.find(_data.pzones, {name: name}) || _data.pzones[0];

      // immediately clear any unsaved operations
      PromotedContentService.clearUnsavedOperations();

      // begin refreshing interface with new pzone data
      return PromotedContentService.$refreshSelectedPZone(_data.previewTime);
    };

    /**
     * Remove content from currently selected pzone.
     *
     * @param {Number} contentId - id of content to delete.
     * @returns {Promise} resolves if content removed, or rejects with an error message.
     */
    PromotedContentService.$removeContentFromPZone = function (contentId) {
      var defer = $q.defer();
      var i = _.findIndex(_data.selectedPZone.content, {id: contentId});
      if (i >= 0) {
        // found it, splice away
        PromotedContentService.$addOperation({
          cleanType: readableOperationTypes.DELETE,
          content: contentId,
          content_title: _data.selectedPZone.content[i].title
        }).then(function () {
          PromotedContentService.markDirtySelectedPZone();
          _data.selectedPZone.content.splice(i, 1);
          defer.resolve();
        }).catch(function (err) {
          defer.reject(err);
        });
      } else {
        defer.reject('Could not find content with given id to delete.');
      }
      return defer.promise;
    };

    /**
     * Content moving function.
     *
     * @param {Number} indexFrom - Index to move content from.
     * @param {Number} indexTo - Index to move content to.
     * @returns {Boolean} true if content moved, false otherwise.
     */
    var moveTo = function (indexFrom, indexTo) {
      var ret = false;
      var content = _data.selectedPZone.content;
      if (indexFrom >= 0 && indexFrom < content.length &&
          indexTo >= 0 && indexTo < content.length) {
        var splicer = content.splice(indexFrom, 1, content[indexTo]);
        if (splicer.length > 0) {
          content[indexTo] = splicer[0];
          ret = true;
          PromotedContentService.markDirtySelectedPZone();
        }
      }
      return ret;
    };

    /**
     * Move content up in the currently selected pzone.
     *
     * @param {Number} index - index of content to move up.
     * @returns {Boolean} true if moved up, false otherwise.
     */
    PromotedContentService.moveContentUp = function (index) {
      return moveTo(index, index - 1);
    };

    /**
    * Move content down in the currently selected pzone.
    *
    * @param {Number} index - index of content to move down.
    * @return {Boolean} true if moved down, false otherwise.
    */
    PromotedContentService.moveContentDn = function (index) {
      return moveTo(index, index + 1);
    };

    /**
     * Begin content insert action.
     *
     * @param {Object} article - article to be inserted.
     */
    PromotedContentService.beginContentInsert = function (article) {
      _data.actionContent = article;
      _data.action = readableOperationTypes.INSERT;
    };

    /**
     * Begin content replace operation.
     *
     * @param {Object} article - article to be replaced.
     */
    PromotedContentService.beginContentReplace = function (article) {
      _data.actionContent = article;
      _data.action = readableOperationTypes.REPLACE;
    };

    /**
     * Stop doing current action.
     */
    PromotedContentService.stopContentAction = function () {
      _data.actionContent = null;
      _data.action = null;
    };

    /**
     * Complete insert or replace operation.
     *
     * @param {Number} index - index where operation will occur.
     * @returns {Promise} resolves with nothing or rejects with an error message.
     */
    PromotedContentService.$completeContentAction = function (index) {
      var deferred = $q.defer();

      if (_data.action) {
        PromotedContentService.$addOperation({
          cleanType: _data.action,
          content: _data.actionContent.id,
          content_title: _data.actionContent.title,
          index: index
        })
          .then(function () {
            // find index of duplicate if there is one
            var duplicateIndex = _.findIndex(_data.selectedPZone.content, {id: _data.actionContent.id});

            // ensure that duplicate is deleted
            if (index !== duplicateIndex && duplicateIndex >= 0) {
              _data.selectedPZone.content.splice(duplicateIndex, 1);
            }

            // add item to pzone
            var replace = _data.action === readableOperationTypes.REPLACE;
            _data.selectedPZone.content.splice(index, (replace ? 1 : 0), _data.actionContent);

            // stop action
            PromotedContentService.stopContentAction();

            // ensure pzone is marked dirty
            PromotedContentService.markDirtySelectedPZone();

            deferred.resolve();
          })
          .catch(deferred.reject);
      } else {
        deferred.reject('No action to complete in progress.');
      }

      return deferred.promise;
    };

    /**
     * Set preview time to some moment. Applying this operation will cause the
     *  unsaved operations list to clear out.
     *
     * @param {moment} time - moment to set _data.preview time as.
     */
    PromotedContentService.setPreviewTime = function (time) {
      // set time to edit
      _data.previewTime = time;

      // clear all unsaved operations
      PromotedContentService.clearUnsavedOperations();

      // begin requesting pzone to edit
      return PromotedContentService.$refreshSelectedPZone(_data.previewTime);
    };

    /**
     * Set preview time to now, effectively causing all operations to be
     *  immediately applied when saved.
     */
    PromotedContentService.setPreviewTimeToImmediate = function () {
      PromotedContentService.setPreviewTime(null);
    };

    /**
     * Check if preview time is set to immediate.
     *
     * @returns true if preview time is immediate, false otherwise.
     */
    PromotedContentService.isPreviewTimeImmediate = function () {
      return _data.previewTime === null;
    };

    /**
     * Check if set preview time is in the past.
     *
     * @returns true if preview time is in the past, false otherwise.
     */
    PromotedContentService.isPreviewTimePast = function () {
      return !PromotedContentService.isPreviewTimeImmediate() &&
        _data.previewTime.isBefore(moment());
    };

    /**
     * Refresh the currently selected pzone. Prevents new requests until the
     *  current one has resolved.
     *
     * @param {moment} [time] - optional time parameter to pass to get a preview.
     * @returns {Promise} resolves with selected pzone data or reject with an error.
     */
    PromotedContentService.$refreshSelectedPZone = function (time) {
      var params = {};
      if (time) {
        params.preview = time.toISOString();
      }

      PromotedContentService.makeOperationsStale();

      var deferred = $q.defer();

      // start a new request if one isn't already pending
      if (!pzoneRefreshPending) {
        pzoneRefreshPending = true;
        _data.selectedPZone.get(params)
          .then(function (data) {
            deferred.resolve();
            _data.selectedPZone = data;
            return _data.selectedPZone;
          })
          .catch(function (err) {
            deferred.reject();
            return err;
          })
          .finally(function () {
            PromotedContentService.markSavedSelectedPZone();
            pzoneRefreshPending = false;
          });
      } else {
        deferred.reject();
      }

      return deferred.promise;
    };

    /**
     * Get the service's data. This function MUST be used to retrieve service
     *  data, accessing service data via the _serviceData variable could
     *  potentially destroy some two-way databinding magic.
     *
     * @returns {Object} service data.
     */
    PromotedContentService.getData = function () {
      return _data;
    };

    /**
     * @returns {Promise} resolves when service is ready.
     */
    PromotedContentService.$ready = function () {
      return setupDefer.promise;
    };

    // setup initial datas
    PromotedContentService.$refreshPZones()
      .then(function () {
        return PromotedContentService.$refreshAllContent();
      })
      .then(function () {
        return PromotedContentService.$selectPZone();
      })
      .then(function () {
        // service is ready to go
        setupDefer.resolve();
      });

  });

'use strict';

angular.module('promotedContentTimePicker.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service'
])
  .directive('promotedContentTimePicker', function (COMPONENTS_URL) {
    return {
      controller: function (moment, $scope, PromotedContentService) {

        $scope.contentData = PromotedContentService.getData();

        $scope.setPreviewTime = function (previewTime) {
          PromotedContentService.setPreviewTime(previewTime);
        };

        $scope.setPreviewTimeToImmediate = function () {
          $scope.previewTime = null;
          PromotedContentService.setPreviewTimeToImmediate();
        };

        $scope.disableControls = function () {
          return PromotedContentService.isPZoneRefreshPending();
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-time-picker/promoted-content-time-picker.html'
    };
  });

'use strict';

angular.module('promotedContentTimePicker', [
  'promotedContentTimePicker.directive'
]);

'use strict';

angular.module('promotedContent', [
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList',
])
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: [
          '$window',
          function ($window) {
            // set title
            $window.document.title = CMS_NAMESPACE + ' | Promotion Tool';
          }
        ],
        templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });

'use strict';

angular.module('reporting.directive', [])
  .directive('reporting', [
    'COMPONENTS_URL',
    function (COMPONENTS_URL) {
      return {
        controller: [
          '$filter', '$http', '$interpolate', '$scope', 'ContentReportingService',
            'ContributionReportingService', 'CmsConfig',
          function ($filter, $http, $interpolate, $scope, ContentReportingService,
              ContributionReportingService, CmsConfig) {

            $scope.reports = {
              Contributions: {
                service: ContributionReportingService,
                headings: [{
                  title: 'Date',
                  expression: 'content.published'
                }, {
                  title: 'Headline',
                  expression: 'content.title'
                }, {
                  title: 'User',
                  expression: 'user.full_name'
                }, {
                  title: 'Role',
                  expression: 'role'
                }, {
                  title: 'Notes',
                  expression: 'notes'
                }],
                downloadURL: CmsConfig.buildBackendApiUrl('contributions/reporting/'),
                orderOptions: [
                  {
                    label: 'Order by User',
                    key: 'user'
                  },
                  {
                    label: 'Order by Content',
                    key: 'content'
                  },
                ]
              },
              Content: {
                service: ContentReportingService,
                headings: [{
                  title: 'Date',
                  expression: 'published'
                }, {
                  title: 'Headline',
                  expression: 'title'
                }, {
                  title: 'URL',
                  expression: 'url'
                }],
                orderOptions: [],
                downloadURL: CmsConfig.buildBackendApiUrl('contributions/contentreporting/'),
              }
            };
            $scope.items = [];
            $scope.headings = [];
            $scope.orderOptions = [];

            $scope.startOpen = false;
            $scope.endOpen = false;

            $scope.$watch('report', function (report) {
              if (!report) {
                return;
              }
              $scope.orderOptions = report.orderOptions;
              if(report.orderOptions.length > 0) {
                $scope.orderBy = report.orderOptions[0];
              } else {
                $scope.orderBy = null;
              }
              $scope.headings = [];
              report.headings.forEach(function (heading) {
                $scope.headings.push(heading.title);
              });

              loadReport(report, $scope.start, $scope.end, $scope.orderBy);
            });

            $scope.$watchCollection('[start, end]', function (params) {
              if (!$scope.report) {
                return;
              }
              var start = params[0];
              var end = params[1];

              loadReport($scope.report, start, end, $scope.orderBy);
            });

            $scope.triggerDownload = function (url) {
              if (!$scope.downloading) {
                $scope.downloading = true;
                $scope.downloadError = false;

                var fileName =
                  'report_' +
                  $filter('date')($scope.start, 'yyyy-MM-dd') +
                  '_to_' +
                  $filter('date')($scope.end, 'yyyy-MM-dd') +
                  '.csv';

                $http({
                  url: url,
                  method: 'GET',
                  responseType: 'arraybuffer',
                  headers: {
                    Accept: 'text/csv'
                  }
                })
                .success(function (data) {
                  var blob = new Blob([data], {
                    type: 'text/csv'
                  });
                  var url = URL.createObjectURL(blob);

                  // make a link to be able to set file name http://stackoverflow.com/a/19328891/468160
                  var a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  a.click();
                  a.remove();

                  URL.revokeObjectURL(url);
                })
                .error(function () {
                  $scope.downloadError = true;
                })
                .finally(function () {
                  $scope.downloading = false;
                });
              }
            };

            $scope.openStart = function ($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $scope.startOpen = true;
            };

            $scope.openEnd = function ($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $scope.endOpen = true;
            };

            $scope.orderingChange = function () {
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
            };

            var loadReport = function (report, start, end, order) {
              $scope.items = [];
              var reportParams = {};
              $scope.downloadURL = report.downloadURL + '?format=csv';
              if (end) {
                var endParam = $filter('date')(end, 'yyyy-MM-dd');
                reportParams['end'] = endParam;
                $scope.downloadURL += ('&end=' + endParam);
              }

              if (start) {
                var startParam = $filter('date')(start, 'yyyy-MM-dd');
                reportParams['start'] = startParam;
                $scope.downloadURL += ('&start=' + startParam);
              }

              if (order) {
                $scope.downloadURL += ('&ordering=' + order.key);
                reportParams['ordering'] = order.key;
              }

              report.service.getList(reportParams).then(function (data) {
                $scope.items = [];
                data.forEach(function (lineItem) {
                  var item = [];
                  report.headings.forEach(function (heading) {
                    var exp = $interpolate('{{item.' + heading.expression + '}}');
                    var value = exp({item: lineItem});
                    item.push(value);
                  });
                  $scope.items.push(item);
                });
              });
            };
          }
        ],
        restrict: 'E',
        scope: {},
        templateUrl: COMPONENTS_URL + 'reporting/reporting.html'
      };
    }
  ]);

'use strict';

angular.module('lineItems.edit.directive', [
  'apiServices.lineItem.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar',
  'utils'
])
  .directive('lineItemsEdit', [
    'COMPONENTS_URL', 'Utils',
    function (COMPONENTS_URL, Utils) {
      return {
        controller: [
          '_', '$location', '$q', '$routeParams', '$scope', 'LineItem',
          function (_, $location, $q, $routeParams, $scope, LineItem) {
            if ($routeParams.id === 'new') {
              $scope.model = LineItem.$build();
              $scope.isNew = true;
            } else {
              $scope.model = LineItem.$find($routeParams.id);
            }

            window.onbeforeunload = function (e) {
              if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
                return 'You have unsaved changes.';
              }
            };

            $scope.$on('$destroy', function() {
              delete window.onbeforeunload;
            });

            $scope.saveModel = function () {
              var promise;

              if ($scope.model) {
                promise = $scope.model.$save().$asPromise().then(function (data) {
                  $location.path('/cms/app/line-items/edit/' + data.id + '/');
                });
              } else {
                var deferred = $q.defer();
                deferred.reject();
                promise = deferred.promise;
              }

              return promise;
            };
          }
        ],
        restrict: 'E',
        scope: {
          getModelId: '&modelId'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting-line-items-edit',
          'reporting-line-items-edit.html'
        )
      };
    }
  ]);

'use strict';

angular.module('lineItems.edit', [
  'lineItems.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/line-items/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Edit Line Item';

              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<line-items-edit id="routeId"></line-items-edit>',
          reloadOnSearch: false
        });
    }
  ]);

'use strict';

angular.module('lineItems.list', [
  'apiServices.lineItem.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'utils'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {
      $routeProvider
        .when('/cms/app/line-items/', {
          controller: [
            '$scope', '$window', 'CMS_NAMESPACE', 'LineItem',
            function($scope, $window, CMS_NAMESPACE, LineItem) {
              $window.document.title = CMS_NAMESPACE + ' | Line Items';

              $scope.modelFactory = LineItem;
            }
          ],
          templateUrl: Utils.path.join(
            COMPONENTS_URL,
            'reporting',
            'reporting-line-items-list',
            'reporting-line-items-list.html'
          )
        });
    }
  ]);

'use strict';

angular.module('rateOverrides.edit.directive', [
  'apiServices.rateOverride.factory',
  'apiServices.featureType.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar',
  'utils'
])
  .directive('rateOverridesEdit', [
    'COMPONENTS_URL', 'Utils',
    function (COMPONENTS_URL, Utils) {
      return {
        controller: [
          '_', '$location', '$http', '$q', '$routeParams', '$scope', 'ContentFactory',
            'FeatureType', 'RateOverride', 'Raven',
          function (_, $location, $http, $q, $routeParams, $scope, ContentFactory,
              FeatureType, RateOverride, Raven) {
                
            var resourceUrl = '/cms/api/v1/contributions/role/';

            if ($routeParams.id === 'new') {
              $scope.model = RateOverride.$build();
              $scope.isNew = true;
            } else {
              $scope.model = RateOverride.$find($routeParams.id);
              $scope.model.$promise.then(function () {
                if (($scope.model.hasOwnProperty('role')) && ($scope.model.role !== null)){
                  $scope.model.role = $scope.model.role.id;
                }
              });
            }

            window.onbeforeunload = function (e) {
              if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
                return 'You have unsaved changes.';
              }
            };

            $scope.$on('$destroy', function() {
              delete window.onbeforeunload;
            });

            $scope.getPaymentType = function (roleId) {
              if ($scope.hasOwnProperty('roles')) {
                for (var i = 0; i < $scope.roles.length; i++) {
                  if ($scope.roles[i].id === roleId) {
                    return $scope.roles[i].payment_type;
                  }
                }
                return null;
              }
            };

            $scope.isFeatureRated = function () {
              if ($scope.getPaymentType($scope.model.role) === 'FeatureType'){
                return true;
              }
              return false;
            };

            $scope.isHourlyRated = function () {
              if ($scope.getPaymentType($scope.model.role) === 'Hourly'){
                return true;
              }
              return false;
            };

            $scope.isFlatRated = function () {
              if ($scope.getPaymentType($scope.model.role) === 'Flat Rate'){
                return true;
              }
              return false;
            };

            $scope.addFeatureType = function () {
              if (!$scope.model.hasOwnProperty('featureTypes')) {
                $scope.model.featureTypes = [];
              }

              $scope.model.featureTypes.push({
                featureType: null,
                rate: 0,
              });
            };

            $scope.getFeatureTypes = function () {
              $http({
                method: 'GET',
                url: resourceUrl
              }).success(function (data) {
                $scope.featureTypes = data.results || data;
              }).error(function (data, status, headers, config) {
                Raven.captureMessage('Error fetching FeatureTypes', {extra: data});
              });
            };

            $scope.getRoles = function () {
              $http({
              method: 'GET',
              url: resourceUrl
                }).success(function (data) {
                  $scope.roles = data.results || data;
                }).error(function (data, status, headers, config) {
                  Raven.captureMessage('Error fetching Roles', {extra: data});
                });
            };

            $scope.searchFeatureTypes = function (searchTerm) {
              return FeatureType.simpleSearch(searchTerm);
            };

            $scope.saveModel = function () {
              var promise;

              if ($scope.model) {
                promise = $scope.model.$save().$asPromise().then(function (data) {
                  $location.path('/cms/app/rate-overrides/edit/' + data.id + '/');
                  if (($scope.model.hasOwnProperty('role')) && ($scope.model.role !== null)){
                    $scope.model.role = $scope.model.role.id;
                  }
                });
              } else {
                var deferred = $q.defer();
                deferred.reject();
                promise = deferred.promise;
              }

              return promise;
            };

            $scope.getRoles();
            $scope.getFeatureTypes();
          }
        ],
        restrict: 'E',
        scope: {
          getModelId: '&modelId'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting-rate-overrides-edit',
          'reporting-rate-overrides-edit.html'
        )
      };
    }
  ]);

'use strict';

angular.module('rateOverrides.edit', [
  'rateOverrides.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/rate-overrides/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Edit Rate Override';
              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<rate-overrides-edit id="routeId"></rate-overrides-edit>',
          reloadOnSearch: false
        });
    }
  ]);

'use strict';

angular.module('rateOverrides.list', [
    'apiServices.rateOverride.factory',
    'bulbsCmsApp.settings',
    'listPage',
    'utils'
  ])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {
      $routeProvider
        .when('/cms/app/rate-overrides/', {
          controller: [
            '$scope', '$window', 'RateOverride', 'CMS_NAMESPACE',
            function ($scope, $window, RateOverride, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Rate Overrides';

              $scope.modelFactory = RateOverride;
            }
          ],
          templateUrl: Utils.path.join(
            COMPONENTS_URL,
            'reporting',
            'reporting-rate-overrides-list',
            'reporting-rate-overrides-list.html'
          )
        });
    }
  ]);

'use strict';

angular.module('roles.edit.directive', [
  'apiServices.reporting.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar',
  'utils'
])
  .constant('PAYMENT_TYPES', [
    {
      name: 'Flat Rate',
      value: 'Flat Rate'
    },
    {
      name: 'FeatureType',
      value: 'FeatureType'
    },
    {
      name: 'Hourly',
      value: 'Hourly'
    },
    {
      name: 'Manual',
      value: 'Manual'
    }
  ])
  .directive('rolesEdit', [
      'COMPONENTS_URL', 'Utils',
      function (COMPONENTS_URL, Utils) {
      return {
        controller: [
          '_', '$location', '$q', '$routeParams', '$scope', 'Role', 'PAYMENT_TYPES',
          function (_, $location, $q, $routeParams, $scope, Role, PAYMENT_TYPES) {

            $scope.page = 'contributions';
            $scope.PAYMENT_TYPES = PAYMENT_TYPES;

            if ($routeParams.id === 'new') {
              $scope.model = Role.$build();
              $scope.isNew = true;
            } else {
              $scope.model = Role.$find($routeParams.id);
            }

            window.onbeforeunload = function (e) {
              if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
                return 'You have unsaved changes.';
              }
            };

            $scope.$on('$destroy', function() {
              delete window.onbeforeunload;
            });

            $scope.rateEditable = function () {
              var paymentTypes = PAYMENT_TYPES.slice(0, 3);
              if (paymentTypes.indexOf($scope.model.paymentType >= 0)) {
                return true;
              }

              return false;
            };

            $scope.saveModel = function () {
              var promise;

              if ($scope.model) {
                promise = $scope.model.$save().$asPromise().then(function (data) {
                  $location.path('/cms/app/roles/edit/' + data.id + '/');
                });
              } else {
                var deferred = $q.defer();
                deferred.reject();
                promise = deferred.promise;
              }

              return promise;
            };
          }
        ],
        restrict: 'E',
        scope: {
          getModelId: '&modelId'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting-roles-edit',
          'reporting-roles-edit.html'
        )
      };
    }
  ]);

'use strict';

angular.module('roles.edit', [
  'roles.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/roles/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {

              $window.document.title = CMS_NAMESPACE + ' | Edit Role';

              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<roles-edit model-id="routeId"></roles-edit>',
          reloadOnSearch: false
        });
    }
  ]);

'use strict';

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbsCmsApp.settings',
    'listPage',
    'utils'
  ])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {
      $routeProvider
        .when('/cms/app/roles/', {
          controller: [
            '$scope', '$window', 'CMS_NAMESPACE', 'Role',
            function($scope, $window, CMS_NAMESPACE, Role) {
              $window.document.title = CMS_NAMESPACE + ' | Roles';

              $scope.modelFactory = Role;
            }
          ],
          templateUrl: Utils.path.join(
            COMPONENTS_URL,
            'reporting',
            'reporting-roles-list',
            'reporting-roles-list.html'
          )
        });
    }
  ]);

'use strict';

angular.module('reports', [
  'lineItems.edit',
  'lineItems.list',
  'rateOverrides.edit',
  'rateOverrides.list',
  'roles.edit',
  'roles.list',
  'utils'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {

      $routeProvider.when('/cms/app/reporting/', {
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting.html'
        ),
        controller: [
          '$scope', '$window', '$filter', '$interpolate', 'CMS_NAMESPACE', 'moment',
            'ContributionReportingService', 'ContentReportingService',
            'FreelancePayReportingService',
          function ($scope, $window, $filter, $interpolate, CMS_NAMESPACE, moment,
              ContributionReportingService, ContentReportingService,
              FreelancePayReportingService) {
            $window.document.title = CMS_NAMESPACE + ' | Reporting'; // set title

            $scope.userFilter = '';
            $scope.userFilters = [
              {
                name: 'All',
                value: ''
              },
              {
                name: 'Staff',
                value: 'staff'
              },
              {
                name: 'Freelance',
                value: 'freelance'
              }
            ];

            $scope.publishedFilter = '';
            $scope.publishedFilters = [
              {
                name: 'All Content',
                value: ''
              },
              {
                name: 'Published',
                value: 'published'
              }
            ];

            $scope.reports = {
              'Contributions': {
                service: ContributionReportingService,
                headings: [
                  {'title': 'Content ID', 'expression': 'content.id'},
                  {'title': 'Headline', 'expression': 'content.title'},
                  {'title': 'FeatureType', 'expression': 'content.feature_type'},
                  {'title': 'Contributor', 'expression': 'user.full_name'},
                  {'title': 'Role', 'expression': 'role'},
                  {'title': 'Pay', 'expression': 'pay'},
                  {'title': 'Date', 'expression': 'content.published | date: \'MM/dd/yyyy\''}
                ],
                downloadURL: '/cms/api/v1/contributions/reporting/',
                orderOptions: [
                  {
                    label: 'Order by User',
                    key: 'user'
                  },
                  {
                    label: 'Order by Content',
                    key: 'content'
                  },
                ]
              },
              'Content': {
                service: ContentReportingService,
                headings: [
                  {'title': 'Content ID', 'expression': 'id'},
                  {'title': 'Headline', 'expression': 'title'},
                  {'title': 'Feature Type', 'expression': 'feature_type'},
                  {'title': 'Article Cost', 'expression': 'value'},
                  {'title': 'Date Published', 'expression': 'published | date: \'MM/dd/yyyy\''}
                ],
                orderOptions: [],
                downloadURL: '/cms/api/v1/contributions/contentreporting/',
              },
              'Freelance Pay': {
                service: FreelancePayReportingService,
                headings: [
                  {'title': 'Contributor', 'expression': 'contributor.full_name'},
                  {'title': 'Contribution #', 'expression': 'contributions_count'},
                  {'title': 'Pay', 'expression': 'pay'},
                  {'title': 'Payment Date', 'expression': 'payment_date | date: \'MM/dd/yyyy\''}
                ],
                orderOptions: [],
                downloadURL: '/cms/api/v1/contributions/freelancereporting/'
              }
            };
            $scope.items = [];
            $scope.headings = [];
            $scope.orderOptions = [];
            $scope.moreFilters = [];

            $scope.startOpen = false;
            $scope.endOpen = false;

            $scope.startInitial = moment().startOf('month').format('YYYY-MM-DD');
            $scope.endInitial = moment().endOf('month').format('YYYY-MM-DD');

            $scope.setReport = function ($reportingService) {
              $scope.report = $reportingService;
            };

            $scope.setUserFilter = function (value) {
              $scope.userFilter = value;
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
            };

            $scope.setPublishedFilter = function (value) {
              $scope.publishedFilter = value;
              if (value === 'published') {
                $scope.end = moment().format('YYYY-MM-DD');
              }
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
            };

            $scope.openStart = function ($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $scope.startOpen = true;
            };

            $scope.openEnd = function ($event) {
              $event.preventDefault();
              $event.stopPropagation();
              $scope.endOpen = true;
            };

            $scope.orderingChange = function () {
              loadReport($scope.report, $scope.start, $scope.end, $scope.orderBy);
            };

            $scope.$watch('report', function (report) {
              if (!report) {
                return;
              }
              $scope.orderOptions = report.orderOptions;
              if(report.orderOptions.length > 0) {
                $scope.orderBy = report.orderOptions[0];
              } else {
                $scope.orderBy = null;
              }
              $scope.headings = [];
              report.headings.forEach(function (heading) {
                $scope.headings.push(heading.title);
              });

              loadReport(report, $scope.start, $scope.end, $scope.orderBy);
            });

            $scope.$watchCollection('[start, end]', function (params) {
              if (!$scope.report) {
                return;
              }
              var start = params[0];
              var end = params[1];

              loadReport($scope.report, start, end, $scope.orderBy);
            });

            function loadReport(report, start, end, order) {
              $scope.items = [];
              var reportParams = {};
              $scope.downloadURL = report.downloadURL + '?format=csv';
              if (end) {
                var endParam = $filter('date')(end, 'yyyy-MM-dd');
                reportParams['end'] = endParam;
                $scope.downloadURL += ('&end=' + endParam);
              }

              if (start) {
                var startParam = $filter('date')(start, 'yyyy-MM-dd');
                reportParams['start'] = startParam;
                $scope.downloadURL += ('&start=' + startParam);
              }

              if (order) {
                $scope.downloadURL += ('&ordering=' + order.key);
                reportParams['ordering'] = order.key;
              }

              if ($scope.publishedFilter) {
                $scope.downloadURL += ('&published=' + $scope.publishedFilter);
                reportParams['published'] = $scope.publishedFilter;
              }

              if ($scope.userFilter) {
                $scope.downloadURL += ('&staff=' + $scope.userFilter);
                reportParams['staff'] = $scope.userFilter;
              }

              if ($scope.moreFilters) {
                for (var key in $scope.moreFilters) {
                  if ($scope.moreFilters[key].type === 'authors') {
                    $scope.downloadURL += ('&' + 'contributors=' + $scope.moreFilters[key].query);
                    reportParams['contributors'] = $scope.moreFilters[key].query;
                  } else {
                    $scope.downloadURL += ('&' + $scope.moreFilters[key].type + '=' + $scope.moreFilters[key].query);
                    reportParams[$scope.moreFilters[key].type] = $scope.moreFilters[key].query;
                  }
                }
              }

              report.service.getList(reportParams).then(function (data) {
                $scope.items = [];
                data.forEach(function (lineItem) {
                  var item = [];
                  report.headings.forEach(function (heading) {
                    var exp = $interpolate('{{item.' + heading.expression + '}}');
                    var value = exp({item: lineItem});
                    item.push(value);
                  });
                  $scope.items.push(item);
                });
              });
            }
          }
        ]
      });
    }
  ]);

'use strict';

angular.module('sections.edit.directive', [
  'apiServices.section.factory',
  'BettyCropper',
  'bulbsCmsApp.settings',
  'copyButton',
  'customSearch',
  'lodash',
  'saveButton.directive',
  'sections.settings',
  'topBar'
])
  .directive('sectionsEdit', function (COMPONENTS_URL) {
    return {
      controller: function (_, $location, $q, $scope, $window, EXTERNAL_URL,
          SECTIONS_LIST_REL_PATH, Section) {

        $scope.LIST_URL = EXTERNAL_URL + SECTIONS_LIST_REL_PATH;

        $scope.needsSave = false;

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new section, build it
          $scope.model = Section.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = Section.$find($scope.getModelId());
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function () {
          // ensure event is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.preview = function () {
          $window.open('//' + $scope.LIST_URL + $scope.model.slug);
        };

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              if (modelId === 'new') {
                $location.path('/cms/app/section/edit/' + data.id + '/');
              }
              $scope.isNew = false;
              $scope.needsSave = false;
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: COMPONENTS_URL + 'sections/sections-edit/sections-edit.html'
    };
  });

'use strict';

angular.module('sections.edit', [
  'bulbsCmsApp.settings',
  'sections.edit.directive'
])
  .config(function ($routeProvider, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/section/edit/:id/', {
        controller: function ($routeParams, $scope, $window) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Edit Section';

          $scope.routeId = $routeParams.id;
        },
        template: '<sections-edit model-id="routeId"></sections-edit>',
        reloadOnSearch: false
      });
  });

'use strict';

angular.module('sections.list', [
  'apiServices.section.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'sections.settings'
])
  .config(function ($routeProvider, COMPONENTS_URL) {

    $routeProvider
      .when('/cms/app/section/', {
        controller: function ($scope, $window, EXTERNAL_URL, SECTIONS_LIST_REL_PATH,
            Section, CMS_NAMESPACE) {

          // set title
          $window.document.title = CMS_NAMESPACE + ' | Section';

          $scope.modelFactory = Section;
          $scope.LIST_URL = EXTERNAL_URL + SECTIONS_LIST_REL_PATH;
        },
        templateUrl: COMPONENTS_URL + 'sections/sections-list/sections-list-page.html'
      });
  });

'use strict';

angular.module('sections.settings', [])
  .value('SECTIONS_LIST_REL_PATH', '/section/');

'use strict';

angular.module('sections', [
  'sections.list',
  'sections.edit'
]);

'use strict';

angular.module('sendToEditor.config', [
  'lodash'
])
  .provider('SendToEditorConfig', function (_) {
    // getter and setter for 'Send to Editor' article statuses
    var articleStatuses = [];

    this.addArticleStatus = function (status) {
      articleStatuses.push(status);
    };

    this.$get = function () {
      return {
          getArticleStatuses: _.constant(articleStatuses)
      };
    };
  });

'use strict';

angular.module('sendToEditor.modal.opener', [
  'sendToEditor.modal'
])
  .directive('sendToEditorModalOpener', [
    'SendToEditorModal',
    function (SendToEditorModal) {
      return {
        restrict: 'A',
        scope: {
          article: '=',
          saveArticle: '=',
          publishSuccessCbk: '='
        },
        link: function (scope, element) {
          var modalInstance = null;
          element.addClass('send-to-editor-modal-opener');
          element.on('click', function () {
            scope.saveArticle().then(function () {
              modalInstance = new SendToEditorModal(scope);
            });
          });
        }
      };
    }
  ]);

'use strict';

angular.module('sendToEditor.modal', [
  'cms.config',
  'sendToEditor.config',
  'ui.bootstrap.modal'
])
  .controller('SendToEditorModal',
    ['$scope', '$http', '$modalInstance', 'CmsConfig', 'SendToEditorConfig', 'moment', 'TIMEZONE_NAME',
    function ($scope, $http, $modalInstance, CmsConfig, SendToEditorConfig, moment, TIMEZONE_NAME) {

      $scope.TIMEZONE_LABEL = moment.tz(TIMEZONE_NAME).format('z');
      $scope.getStatus = function (article) {
        if(!article || !article.published){
          return 'unpublished';
        }else if(moment(article.published) > moment()){
          return 'scheduled';
        }else{
          return 'published';
        }
      };

      $scope.confirm = function () {
        $scope.$close();
        $scope.modalOnOk();
      };

      $scope.cancel = function () {
        $scope.$dismiss();
        $scope.modalOnCancel();
      };

      $scope.buttonConfig = {
        idle: 'Send',
        busy: 'Sending',
        finished: 'Sent!',
        error: 'Error!'
      };

      $scope.articleStatuses = SendToEditorConfig.getArticleStatuses();
      $scope.status = $scope.articleStatuses[0];

      $scope.sendToEditor = function (article) {
        return $http({
          url: CmsConfig.buildBackendApiUrl('content/' + article.id + '/send/'),
          method: 'POST',
          data: {
            notes: $scope.noteToEditor,
            status: $scope.status
          }
        }).success(function (data) {
          $scope.publishSuccessCbk({article: article, response: data});
          $modalInstance.close();
        }).error(function (error, status) {
          $modalInstance.dismiss();
        });
      };
    }
  ])
  .factory('SendToEditorModal', [
    '$modal', 'COMPONENTS_URL',
    function ($modal, COMPONENTS_URL) {

      var SponsoredContentModal = function (scope) {
        return (function (scope) {
          $modal
            .open({
              controller: 'SendToEditorModal',
              scope: scope,
              templateUrl: COMPONENTS_URL + 'send-to-editor/send-to-editor-modal.html'
            });
        })(scope);
      };

      return SponsoredContentModal;
    }
  ]);

'use strict';

angular.module('sendToEditor', [
  'sendToEditor.modal.opener'
]);

'use strict';

angular.module('specialCoverage.edit.directive', [
  'apiServices.specialCoverage.factory',
  'autocompleteBasic',
  'bulbsCmsApp.settings',
  'apiServices.campaign.factory',
  'customSearch',
  'lodash',
  'specialCoverage.settings',
  'topBar',
  'ui.bootstrap.tooltip',
  'videoList',
  'moment'
])
  .directive('specialCoverageEdit', function (COMPONENTS_URL) {
    return {
      controller: function (_, $location, $q, $scope, $window, moment, Campaign, EXTERNAL_URL,
          SPECIAL_COVERAGE_LIST_REL_PATH, SpecialCoverage) {

        $scope.ACTIVE_STATES = SpecialCoverage.ACTIVE_STATES;
        $scope.LIST_URL = EXTERNAL_URL + SPECIAL_COVERAGE_LIST_REL_PATH;

        $scope.needsSave = false;

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new special coverage, build it
          $scope.model = SpecialCoverage.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = SpecialCoverage.$find($scope.getModelId());
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function () {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.getQueryParams = function () {
          return {
            before: moment().format('YYYY-MM-DDTHH:mmZ')
          };
        };

        $scope.preview = function () {
          $window.open('//' + $scope.LIST_URL + $scope.model.slug);
        };

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              if (modelId === 'new') {
                $location.path('/cms/app/special-coverage/edit/' + data.id + '/');
              }
              $scope.isNew = false;
              $scope.needsSave = false;
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };

        $scope.searchCampaigns = function (searchTerm) {
          return Campaign.simpleSearch(searchTerm);
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: COMPONENTS_URL + 'special-coverage/special-coverage-edit/special-coverage-edit.html'
    };
  });

'use strict';

angular.module('specialCoverage.edit', [
  'specialCoverage.edit.directive'
])
  .config(function ($routeProvider, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/special-coverage/edit/:id/', {
        controller: function ($routeParams, $scope, $window) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Edit Special Coverage';

          $scope.routeId = $routeParams.id;
        },
        template: '<special-coverage-edit model-id="routeId"></special-coverage-edit>'
      });
  });

'use strict';

angular.module('specialCoverage.list', [
  'apiServices.specialCoverage.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'specialCoverage.settings'
])
  .config(function ($routeProvider, COMPONENTS_URL) {

    $routeProvider
      .when('/cms/app/special-coverage/', {
        controller: function ($scope, $window, EXTERNAL_URL, SPECIAL_COVERAGE_LIST_REL_PATH,
            SpecialCoverage, CMS_NAMESPACE) {

          // set title
          $window.document.title = CMS_NAMESPACE + ' | Special Coverage';

          $scope.modelFactory = SpecialCoverage;
          $scope.LIST_URL = EXTERNAL_URL + SPECIAL_COVERAGE_LIST_REL_PATH;
        },
        templateUrl: COMPONENTS_URL + 'special-coverage/special-coverage-list/special-coverage-list-page.html'
      });
  });

'use strict';

angular.module('specialCoverage.settings', [])
  .value('SPECIAL_COVERAGE_LIST_REL_PATH', '/special/');

'use strict';

angular.module('specialCoverage', [
  'specialCoverage.list',
  'specialCoverage.edit'
]);

'use strict';

angular.module('statusFilter.directive', [
  'bulbsCmsApp.settings',
  'contentServices.listService'
])
  .provider('StatusFilterOptions', function (moment) {
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
  .directive('statusFilter', function ($location, _, StatusFilterOptions, ContentListService, COMPONENTS_URL) {
    return {
      templateUrl: COMPONENTS_URL + 'status-filter/status-filter.html',
      restrict: 'E',
      scope: {},
      controller: 'ContentlistCtrl',
      link: function postLink(scope, element, attrs) {
        scope.options = StatusFilterOptions.getStatuses();

        /**
         * Test if a particular option is currently active by comparing it to
         *  $location.search().
         *
         * @param {object} option - option parameters to test for.
         * @returns true if option is in $location.search, false otherwise.
         */
        scope.isActive = function (option) {
          if (option.key && option.key in $location.search() &&
              $location.search()[option.key] === getValue(option)) {
            return true;
          } else if (!option.key) { //all
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

          return ContentListService.$updateContent(search, false);
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

angular.module('statusFilter', [
  'statusFilter.directive'
]);

'use strict';

/**
 * List of tag-like things that has remove functionality.
 */
angular.module('tagList', [
  'lodash',
  'utils'
])
  .directive('tagList', [
    'COMPONENTS_URL',
    function (COMPONENTS_URL) {
      return {
        controller: [
          '_', '$scope', 'Utils',
          function (_, $scope, Utils) {
            $scope.remove = function (item) {
              var i = _.findIndex($scope.items, item);
              Utils.removeFrom($scope.items, i);
            };
          }
        ],
        restrict: 'E',
        scope: {
          items: '=',
          itemDisplayFormatter: '&'
        },
        templateUrl: COMPONENTS_URL + 'tag-list/tag-list.html'
      };
    }
  ]);

'use strict';

angular.module('templateTypeField.directive', [])
  .directive('templateTypeField', function (COMPONENTS_URL) {
    return {
      controller: function (_, $scope, ContentFactory, TEMPLATE_TYPES) {
        $scope.templateTypes = _.filter(TEMPLATE_TYPES, {content_type: $scope.content.polymorphic_ctype});
      },
      restrict: 'E',
      scope: {
        content: '='
      },
      templateUrl: COMPONENTS_URL + 'template-type-field/template-type-field.html'
    };
  });

'use strict';

angular.module('templateTypeField', [
  'templateTypeField.directive'
])
  .value('TEMPLATE_TYPES', [{
      name: 'Small Width',
      slug: 'small-width',
      content_type: 'content_content'
    }, {
      name: 'Large Width',
      slug: 'large-width',
      content_type: 'content_content'
    }]);

'use strict';

/**
 * Renders a topbar template based on a given path relative to "/components/".
 */
angular.module('topBar.directive', [])
  .directive('topBar', function (COMPONENTS_URL, CmsConfig) {
    return {
      restrict: 'E',
      scope: {
        logoHref: '@',
        itemsDropdownTitle: '@',
        itemsDropdown: '=',
        itemsTop: '=',
        saveFunction: '=',
        saveDisableWhen: '&'
      },
      templateUrl: COMPONENTS_URL + 'top-bar/top-bar-base.html',
      link: function (scope) {
        scope.NAV_LOGO = CmsConfig.getLogoUrl();
      }
    };
  });

'use strict';

angular.module('topBar.item.factory', [])
  .factory('TopBarItem', function () {

    var TopBarItem = function (params) {
      this.displayText = params.displayText || '';
      this.displayIconClasses = params.displayIconClasses || '';
      this.containerClasses = params.containerClasses || '';
      this.clickFunction = params.clickFunction || function () {};
    };

    return TopBarItem;
  });

'use strict';

angular.module('topBar', [
  'topBar.directive',
  'topBar.item.factory'
]);

'use strict';

/**
 * Restmod mixin that looks for fieldDisplays in $configs, objects with a title and
 *  optionally a value and sorts property.
 *
 *  title is used to label a given field, should be unique.
 *
 *  value is an optional field transformed into a new property function called
 *    evalute; when invoked with a record, value string will evaluate with $parse,
 *    where 'record' is the given record.
 *
 *  sorts is an optional field that can be a string or a function. As a string it
 *    should be the name of a property to order by. As a function, it should take
 *    a direction--'asc'/undefined for the default direction, 'desc' for the opposite
 *    direction--and return an ordering string.
 *
 * Field display objects are available at the model level as the $fieldDisplays function.
 *  Returns a list of field displays to be used in templates.
 */
angular.module('apiServices.mixins.fieldDisplay', [
  'restmod'
])
  .factory('FieldDisplay', function($parse, restmod) {

    /**
     * Generates a function that can be passed a record and evalutes given value
     *  string agaist that record to return the string to be displayed to the user.
     *
     *  @param {string} value - string that will be evaluted with record as an instance
     *    of model, e.g. the value string 'record.name' would print out the instance's
     *    name property.
     *  @returns {function} takes a record and is evaluates the given value with given
     *    record.
     */
    var parserWrap = function (value) {
      // return a function that can be called with given string to generate parser
      return (function (value) {
        // return a function that will be called in template
        var parsed = $parse(value);
        return function (record) {
          // use angular's $parse to create a function that will eval in the correct scope
          return parsed({record: record});
        };
      })(value);
    };

    /**
     * Default sorting string builder. If field display object sorts property is a
     *  function, that will override the functionality provided by this function. Use
     *  this for more complex sorting strings, such as those that have multiple paramters.
     *
     * @param {String} sorts - sorts property provided by field display object. Should be
     *  the non-negated property name to sort on.
     * @returns {function} evaluated with a direction string, either 'asc'/undefined for the
     *  default sorting direction, or 'desc' for opposite sorting direction.
     */
    var getOrdering = function (sorts) {
      return (function (sorts) {
        return function (direction) {
          var ordering = '';
          if (direction === 'desc') {
            // do opposite of default sort
            ordering = '-' + sorts;
          } else {
            // do default sort, only supports 1 parameter
            ordering = sorts;
          }
          return ordering;
        };
      })(sorts);
   };

    return restmod.mixin(function () {

      this.define('Scope.$fieldDisplays', function () {
        var fieldDisplays = this.getProperty('fieldDisplays');
        if (fieldDisplays) {
          var i;
          for (i = 0; i < fieldDisplays.length; i++) {
            var fieldDisplay = fieldDisplays[i];

            // set up evaluation function if a value was provided
            if (fieldDisplay.value) {
              fieldDisplay.evaluate = parserWrap(fieldDisplay.value);
            }

            // set up storting function if sorts was provided
            fieldDisplay.getOrdering = function () {};
            if (fieldDisplay.sorts) {
              if (typeof fieldDisplay.sorts === 'function') {
                // sort function was provided, use that
                fieldDisplay.getOrdering = fieldDisplay.sorts;
              } else {
                // function not provided, use default one
                fieldDisplay.getOrdering = getOrdering(fieldDisplay.sorts);
              }
            }
          }
        }
        return fieldDisplays;
      });

    });
  });

'use strict';

angular.module('apiServices.styles', [
  'lodash',
  'restmod'
])
  .factory('DjangoDRFPagedApi', function (_, restmod, inflector) {
    var singleRoot = 'root';
    var manyRoot = 'results';

    return restmod.mixin('DefaultPacker', {
      $config: {
        style: 'DjangoDRFPagedApi',
        primaryKey: 'id',
        jsonMeta: '.',
        jsonLinks: '.',
        jsonRootMany: manyRoot,
        jsonRootSingle: singleRoot
      },

      $extend: {
        Collection: {
          $page: 1,
          $totalCount: 0
        },

        // special snakecase to camelcase renaming
        Model: {
          decodeName: inflector.camelize,
          encodeName: function(_v) { return inflector.parameterize(_v, '_'); },
          encodeUrlName: inflector.parameterize
        }
      },

      $hooks: {
        'before-request': function (_req) {
          _req.url += '/';
        },
        'before-fetch-many': function (_req) {
          // add paging parameter here based on collection's $page property
          if (_.isUndefined(_req.params)) {
            _req.params = {};
          }
          _req.params.page = this.$page || 1;
        },
        'after-request': function (_req) {
          // check that response has data we need
          if (!_.isUndefined(_req.data) && _.isUndefined(_req.data[manyRoot])) {
            // a dirty hack so we don't have to copy/modify the DefaultPacker:
            // this is not a collection, make it so the single root is accessible by the packer
            var newData = {};
            newData[singleRoot] = _req.data;
            _req.data = newData;
          }
        },
        'after-fetch-many': function (_req) {
          this.$totalCount = _req.data.count;
        }
      }
    });
  });

'use strict';

angular.module('apiServices', [
  'apiServices.settings',
  'restmod',
  'restmod.styles.drfPaged'
])
  .config(function (API_URL_ROOT, restmodProvider) {
    restmodProvider.rebase('DjangoDRFPagedApi', {
      $config: {
        style: 'BulbsApi',
        urlPrefix: API_URL_ROOT
      }
    });
  });

'use strict';

angular.module('apiServices.author.factory', [
  'apiServices'
])
  .factory('Author', [
    'restmod',
    function (restmod) {
      return restmod.model('author').mix({
        $config: {
          name: 'Author',
          plural: 'Authors',
          primaryKey: 'id'
        },
        $extend: {
          Record: {
            displayName: function () {
              var name = '';

              if (this.firstName && this.lastName) {
                name = this.firstName + ' ' + this.lastName;
              } else if (this.lastName) {
                name = this.lastName;
              } else {
                name = this.username;
              }

              return name;
            }
          }
        }
      });
    }
  ]);

'use strict';

angular.module('apiServices.campaign.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment'
])
  .factory('Campaign', function (restmod) {
    return restmod.model('campaign').mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Campaign',
        plural: 'Campaigns',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Campaign',
          value: 'record.campaignLabel',
          sorts: 'campaign_label'
        }, {
          title: 'Sponsor',
          value: 'record.sponsorName',
          sorts: 'sponsor_name'
        }, {
          title: 'Start Date',
          value: 'record.startDate.format("MM/DD/YY") || "--"',
          sorts: 'start_date'
        }, {
          title: 'End Date',
          value: 'record.endDate.format("MM/DD/YY") || "--"',
          sorts: 'end_date'
        }]
      },

      pixels: {
        init: [{}],
      },

      // fields from frontend to backend
      end_date: {
        encode: 'moment_to_date_string',
      },
      start_date: {
        encode: 'moment_to_date_string',
      },

      // fields from backend to frontend
      endDate: {
        decode: 'date_string_to_moment',
      },
      startDate: {
        decode: 'date_string_to_moment'
      },

      $extend: {
        Model: {
          simpleSearch: function (searchTerm) {
            return this.$search({search: searchTerm, ordering: 'campaign_label'}).$asPromise();
          }
        }
      }
    });
  });

'use strict';

angular.module('apiServices.customSearch.count.factory', [
  'apiServices',
  'apiServices.customSearch.settings'
])
  .factory('CustomSearchCount', function (_, CustomSearchSettings, restmod) {

    var Count = restmod.model(CustomSearchSettings.countEndpoint).mix({
      count: 0
    });

    return {
      $retrieveResultCount: function (query) {
        return Count.$create(query).$asPromise()
          .then(function (model) {
            return model.$response.data.root.count;
          });
      }
    };
  });

'use strict';

/**
 * Wrapper functions for custom search endpoints.
 */
angular.module('apiServices.customSearch.factory', [
  'apiServices.customSearch.count.factory',
  'apiServices.customSearch.groupCount.factory',
  'apiServices.customSearch.settings',
  'lodash',
  'restmod'
])
  .factory('CustomSearch', function (_, restmod, CustomSearchCount, CustomSearchGroupCount,
      CustomSearchSettings) {

    var CustomSearch = restmod.model(CustomSearchSettings.searchEndpoint).mix({
      $hooks: {
        'before-save': function (_req) {
          _req.url += '/?page=' + _req.data.page;
        }
      }
    });

    return {
      $retrieveResultCount: CustomSearchCount.$retrieveResultCount,
      $retrieveGroupCount: CustomSearchGroupCount.$retrieveResultCount,
      $retrieveContent: function (query) {
        return CustomSearch.$create(query).$asPromise()
          .then(function (model) {
            return model.$response.data;
          });
      }
    };
  });

'use strict';

angular.module('apiServices.customSearch.groupCount.factory', [
  'apiServices',
  'apiServices.customSearch.settings'
])
  .factory('CustomSearchGroupCount', function (_, CustomSearchSettings, restmod) {

    var Count = restmod.model(CustomSearchSettings.groupCountEndpoint).mix({
      count: 0
    });

    return {
      $retrieveResultCount: function (query) {
        return Count.$create(query).$asPromise()
          .then(function (model) {
            return model.$response.data.root.count;
          });
      }
    };
  });

'use strict';

angular.module('apiServices.customSearch.settings', [])
  .constant('CUSTOM_SEARCH_ENDPOINT', 'custom-search-content')
  .constant('CUSTOM_SEARCH_REL_COUNT_ENDPOINT', 'count')
  .constant('CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT', 'group_count')
  .service('CustomSearchSettings', function (CUSTOM_SEARCH_ENDPOINT,
      CUSTOM_SEARCH_REL_COUNT_ENDPOINT, CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT) {

    return {
      searchEndpoint: CUSTOM_SEARCH_ENDPOINT,
      groupCountEndpoint: CUSTOM_SEARCH_ENDPOINT + '/' + CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT,
      countEndpoint: CUSTOM_SEARCH_ENDPOINT + '/' + CUSTOM_SEARCH_REL_COUNT_ENDPOINT
    };
  });

'use strict';

angular.module('apiServices.featureType.factory', [
  'apiServices'
])
  .factory('FeatureType', [
    'restmod',
    function (restmod) {
      return restmod.model('things').mix('NestedDirtyModel', {
        $config: {
          name: 'FeatureType',
          plural: 'FeatureTypes',
          primaryKey: 'id',
        },

        $extend: {
          Model: {
            simpleSearch: function (searchTerm) {
              return this.$search({type: 'feature_type', q: searchTerm}).$asPromise();
            }
          }
        }
      });
    }]
  );
'use strict';

angular.module('apiServices.lineItem.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('LineItem', function (_, restmod) {
    var contributorEndpoint = 'contributions/line-items';

    return restmod.model(contributorEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Line Item',
        plural: 'Line Items',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Contributor',
            value: 'record.contributor.fullName'
          },
          {
            title: 'Amount $',
            value: 'record.amount'
          },
          {
            title: 'Note',
            value: 'record.note'
          },
          {
            title: 'Date',
            value: 'record.paymentDate.format("MM/DD/YY") || "--"',
          }
        ]
      },

      paymentDate: {
        decode: 'date_string_to_moment',
        encode: 'moment_to_date_string'
      },
      payment_date: {
        decode: 'date_string_to_moment',
        encode: 'moment_to_date_string',
      }

    });
  });
'use strict';

angular.module('apiServices.rateOverride.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('RateOverride', function (_, restmod) {
    var rateOverrideEndpoint = 'contributions/rate-overrides';

    return restmod.model(rateOverrideEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Rate Override',
        plural: 'Rate Overrides',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Name',
            value: 'record.contributor.fullName'
          },
          {
            title: 'Role',
            value: 'record.role.name'
          }
        ]
      },
      role: {
        init: {}
      },
      $hooks: {
        'before-save': function(_req) {
          var featureTypes = _req.data.feature_types;
          if (featureTypes.length > 0) {
            for (var key in featureTypes) {
              var obj = featureTypes[key];
              if (obj.hasOwnProperty('featureType')) {
                if (obj.featureType.hasOwnProperty('name')) {
                  _req.data.feature_types[key].feature_type = obj.featureType.name;
                } else if (obj.featureType.hasOwnProperty('value')) {
                  _req.data.feature_types[key].feature_type.slug = obj.featureType.value;
                }
              }
            }
          }
        },
        'before-render': function(record) {
          if (record.hasOwnProperty('feature_types')) {
            for (var key in record.feature_types) {
              if (record.feature_types[key].hasOwnProperty('feature_type')){
                if (record.feature_types[key].feature_type.hasOwnProperty('name')) {
                  record.feature_types[key].feature_type = record.feature_types[key].feature_type.name;
                }
              }
            }
          }
        }
      }
    });
  });
'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Role', function (_, restmod) {
    // var contributionsEndpoint = 'contributions';
    var roleEndpoint = 'contributions/role';

    return restmod.model(roleEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Role',
        plural: 'Roles',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Role',
            value: 'record.name'
          },
          {
            title: 'Payment Type',
            value: 'record.paymentType'
          }
        ]
      },
      rates: {
        init: {
          featureType: []
        }
      }
    });
  });
'use strict';

angular.module('apiServices.section.factory', [
  'apiServices',
  'apiServices.customSearch.count.factory',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Section', function (_, CustomSearchCount, restmod) {
    var sectionEndpoint = 'section';

    return restmod.model(sectionEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Section',
        plural: 'Sections',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Section Name',
          value: 'record.name',
          sorts: 'name'
        }, {
          title: 'Article Count',
          value: 'record.$resultCount'
        }]
      },
      query: {
        init: {}
      },
      promoted: {
        init: true
      },
      $hooks: {
        'after-fetch': function () {
          this.$refreshResultCount();
        },
        'after-fetch-many': function () {
          _.each(this, function (record) {
            record.$refreshResultCount();
          });
        }
      },
      $extend: {
        Record: {
          /**
           * Getter for section content count.
           *
           * @returns {String} section content count.
           */
          $refreshResultCount: function () {
            var record = this;
            return CustomSearchCount.$retrieveResultCount(this.query)
              .then(function (count) {
                record.$resultCount = count;
              });
          }
        }
      },
    });
  });

'use strict';

angular.module('apiServices.specialCoverage.factory', [
  'apiServices',
  'apiServices.campaign.factory',
  'apiServices.mixins.fieldDisplay',
  'VideohubClient.api'
])
  .factory('SpecialCoverage', function (_, $parse, restmod, Video) {
    var ACTIVE_STATES = {
      INACTIVE: 'Inactive',
      ACTIVE: 'Active',
      PROMOTED: 'Pin to HP'
    };

    return restmod.model('special-coverage').mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Special Coverage',
        plural: 'Special Coverages',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'List Title',
          value: 'record.name',
          sorts: 'name'
        }, {
          title: 'Sponsor',
          value: 'record.campaign.sponsorName || "--"',
          sorts: 'campaign__sponsor_name'
        }, {
          title: 'Campaign',
          value: 'record.campaign.campaignLabel || "--"',
          sorts: 'campaign__campaign_label'
        }, {
          title: 'Status',
          value: 'record.$activeState()',
          sorts: function (direction) {
            var sorting;
            if (direction === 'asc') {
              sorting = 'promoted,active';
            } else {
              sorting = '-promoted,-active';
            }
            return sorting;
          }
        }]
      },

      campaign: {
        belongsTo: 'Campaign',
        prefetch: true,
        key: 'campaign'
      },
      listUrl: {
        mask: 'CU'
      },
      query: {
        init: {}
      },
      videos: {
        belongsToMany: 'Video',
        keys: 'videos'
      },
      active: {
        init: true
      },
      promoted: {
        init: false
      },

      $hooks: {
        'after-fetch': function () {
          // auto fetch all video records when first fetching
          this.$loadVideosData();
        },
        'after-save': function () {
          // auto fetch all video records when saving/updating
          this.$loadVideosData();
        }
      },

      $extend: {
        Record: {
          /**
           * Load video data by filling in video models listed in videos property.
           */
          $loadVideosData: function () {
            _.each(this.videos, function (video) {
              video.$fetch();
            });
          },
          /**
           * Add a video by id.
           *
           * @param {Number} id - id of video to add.
           * @returns {Boolean} true if video was added, false otherwise.
           */
          addVideo: function (video) {
            var added = false;

            // check that video is not already in list
            var existingVideo = _.find(this.videos, function (existingVideo) {
              return video.id === existingVideo.id;
            });

            if (!existingVideo) {
              // not in list, add it to list
              this.videos.push(video);
              added = true;
            }

            return added;
          },
          /**
           * Getter/setter for active state, a front end standin for the active
           *  and promoted flags.
           *
           * @param {String} [activeState] - set this value when using as setter.
           * @returns {String} current activeState.
           */
          $activeState: function (activeState) {
            if (_.isString(activeState)) {
              if (activeState === ACTIVE_STATES.ACTIVE) {
                this.active = true;
                this.promoted = false;
              } else if (activeState === ACTIVE_STATES.PROMOTED) {
                this.active = true;
                this.promoted = true;
              } else {
                this.active = false;
                this.promoted = false;
              }
            } else {
              activeState = ACTIVE_STATES.INACTIVE;
              if (this.active && this.promoted) {
                activeState = ACTIVE_STATES.PROMOTED;
              } else if (this.active) {
                activeState = ACTIVE_STATES.ACTIVE;
              }
            }
            return activeState;
          }
        },
        Model: {
          ACTIVE_STATES: _.clone(ACTIVE_STATES)
        }
      },
    });
  });

'use strict';

angular.module('apiServices.tag.factory', [
  'apiServices'
])
  .factory('Tag', function (_, restmod) {
    return restmod.model('tag').mix({
      $config: {
        name: 'Tag',
        plural: 'Tags',
        primaryKey: 'id'
      }
    });
  });

'use strict';

/**
 * Filter and directive that can be used in templates to build correct urls for
 *  interaction with the backend.
 */
angular.module('backendApiHref', [
  'cms.config',
  'jquery'
])
  .filter('backendApiHref', [
    'CmsConfig',
    function(CmsConfig) {
      return function (relUrl) {
        return CmsConfig.buildBackendApiUrl(relUrl);
      };
    }]
  )
  .filter('backendHref', [
    'CmsConfig',
    function (CmsConfig) {
      return function (relUrl) {
        return CmsConfig.buildBackendUrl(relUrl);
      };
    }]
  )
  .directive('backendApiHref', [
    '$', '$filter',
    function ($, $filter) {
      return {
        restrict: 'A',
        scope: {
          backendApiHref: '@'
        },
        link: function (scope, iElement) {
          $(iElement).attr('href', $filter('backendApiHref')(scope.backendApiHref));
        }
      };
    }]
  )
  .directive('backendHref', [
    '$', '$filter',
    function ($, $filter) {
      return {
        restrict: 'A',
        scope: {
          backendHref: '@'
        },
        link: function (scope, iElement) {
          $(iElement).attr('href', $filter('backendHref')(scope.backendHref));
        }
      };
    }]
  );

'use strict';

angular.module('cms.config', [
  'lodash'
])
  .provider('CmsConfig', function CmsConfigProvider (_) {
    // relative api path, rel to backendRoot
    var apiPath = '';
    // root for all backend requests
    var backendRoot = '';
    // default width to request for images
    var imageDefaultWidth = 1200;
    // image server root
    var imageServerRoot = '';
    // api key for accessing image server
    var imageServerApiKey = '';
    // url to inline objects file
    var inlineObjectsUrl = '';
    // create content modal template to use
    var createContentTemplateUrl = '';
    // mappings where pairs are <template-url>: <polymorphic_ctype[]>
    //  for looking up edit page templates
    var editPageMappings = {};
    // url for logo to display in CMS
    var logoUrl = '';
    // callback to fire when user is attempting to logout
    var logoutCallback = function () {};
    // mappings where pairs are <name>: <template-url> for looking up toolbar templates
    var toolbarMappings = {};

    var error = function (message) {
      return new ConfigError('CmsConfig', message);
    };

    var getOrFail = function (obj, key, failureMessage) {
      if (key in obj) {
        return obj[key];
      }
      throw error(failureMessage || 'Unable to find mapping.');
    };

    var findEditPageMapping = function (type) {
      return _.findKey(editPageMappings, function (types) {
        if(_.contains(types, type)) {
          return true;
        }
      });
    };

    this.setApiPath = function (value) {
      if (_.isString(value)) {
        apiPath = value;
      } else {
        throw error('apiPath must be a string!');
      }
      return this;
    };

    this.setBackendRoot = function (value) {
      if (_.isString(value)) {
        backendRoot = value;
      } else {
        throw error('backendRoot must be a string!');
      }
      return this;
    };

    this.setImageDefaultWidth = function (num) {
      if (_.isNumber(num)) {
        imageDefaultWidth = num;
      } else {
        throw error('imageDefaultWidth must be a number!');
      }
      return this;
    };

    this.setImageServerRoot = function (value) {
      if (_.isString(value)) {
        imageServerRoot = value;
      } else {
        throw error('imageServerRoot must be a string!');
      }
      return this;
    };

    this.setImageServerApiKey = function (value) {
      if (_.isString(value)) {
        imageServerApiKey = value;
      } else {
        throw error('imageServerApiKey must be a string!');
      }
      return this;
    };

    this.setInlineObjectsUrl = function (value) {
      if (_.isString(value)) {
        inlineObjectsUrl = value;
      } else {
        throw error('inlineObjectsUrl must be a string!');
      }
      return this;
    };

    this.setCreateContentTemplateUrl = function (value) {
      if (_.isString(value)) {
        createContentTemplateUrl = value;
      } else {
        throw error('createContentTemplateUrl must be a string!');
      }
      return this;
    };

    this.setLogoUrl = function (value) {
      if (_.isString(value)) {
        logoUrl = value;
      } else {
        throw error('logoUrl must be a string!');
      }
      return this;
    };

    this.setToolbarMappings = function (obj) {
      if (_.isObject(obj)) {
        toolbarMappings = _.clone(obj);
      } else {
        throw error('toolbarMappings must be an object!');
      }
      return this;
    };

    /**
     * Remove a polymorphic_ctype from edit page mappings.
     *
     * @param {String} type - polymorphic_ctype to remove from mappings.
     */
    this.removeEditPageMapping = function (type) {
      var template = findEditPageMapping(type);

      if (template) {
        // found mapping, remove type
        editPageMappings[template] = _.without(type);
      }

      return this;
    };

    /**
     * Add a template -> polymorphic_ctype edit page mapping.
     *
     * @param {String} templateUrl - url for edit page template.
     * @param {String|String[]} type - content type to map to template.
     */
    this.addEditPageMapping = function (templateUrl, type) {
      if (!_.isString(templateUrl)) {
        throw error('templateUrl must be a string!');
      }

      var typeIsString = _.isString(type);
      if (!(typeIsString || _.isArray(type))) {
        throw error('type must be a string or array!');
      }

      // normalize type input so we can just treat everything as an array
      var types = [];
      if (typeIsString) {
        types.push(type);
      } else {
        types = type;
      }

      _.forEach(types, function (type) {
        var mapping = findEditPageMapping(type);
        if (mapping) {
          // this type is already mapped, fail out
          throw error('type "' + type + '" is already mapped to "' + mapping +'"!');
        }

        if (templateUrl in editPageMappings) {
          // template mapping already exists, add type to list for this template
          editPageMappings[templateUrl].push(type);
        } else {
          // template mapping does not exist yet, create a new list
          editPageMappings[templateUrl] = [type];
        }
      });

      return this;
    };

    this.setEditPageMappings = function (obj) {
      if (_.isObject(obj)) {
        editPageMappings = _.clone(obj);
      } else {
        throw error('editPageMappings must be an object!');
      }
      return this;
    };

    this.setLogoutCallback = function (func) {
      if (_.isFunction(func)) {
        logoutCallback = func;
      } else {
        throw error('logoutCallback must be a function!');
      }
      return this;
    };

    this.$get = function () {
      return {
        getCreateContentTemplateUrl: _.constant(createContentTemplateUrl),
        getImageDefaultWidth: _.constant(imageDefaultWidth),
        getImageServerApiKey: _.constant(imageServerApiKey),
        getInlineObjectsUrl: _.constant(inlineObjectsUrl),
        getLogoUrl: _.constant(logoUrl),
        logoutCallback: logoutCallback,
        /**
         * Get the template url for given toolbar.
         *
         * @param {string} type - Type to find mapping for.
         * @returns Template url mapped to given type.
         */
        getToolbarTemplateUrl: function (type) {
          return getOrFail(toolbarMappings, type, 'Unable to find toolbar template for type "' + type + '"');
        },
        /**
         * Get edit page template for given type.
         *
         * @param {string} type - Type to find mapping for.
         * @returns Template url mapped to given type.
         */
        getEditPageTemplateUrl: function (type) {
          var template = findEditPageMapping(type);

          if (template) {
            return template;
          } else {
            throw error('Unable to find edit page template for type "' + type + '"');
          }
        },
        /**
         * Create an absolute api url.
         *
         * @param {string} relUrl - relative url to get the absolute api url for.
         * @returns absolute api url.
         */
        buildBackendApiUrl: function (relUrl) {
          return backendRoot + apiPath + (relUrl || '');
        },
        /**
         * Build a url relative to backend root.
         *
         * @param {string} relUrl - relative url to get the absolute url for.
         * @returns absolute url.
         */
        buildBackendUrl: function (relUrl) {
          return backendRoot + (relUrl || '');
        },
        /**
         * Build a url relative to image server root.
         *
         * @param {string} relUrl - relative image server url to get absolute url for.
         * @returns absolute url on image server.
         */
        buildImageServerUrl: function (relUrl) {
          return imageServerRoot + (relUrl || '');
        }
     };
    };
  });

'use strict';

angular.module('cms.image', [
  'cms.config',
  'jquery'
])
  .service('CmsImage', [
    '$', 'CmsConfig',
    function ($, CmsConfig) {

      /* We can request an image at every possible width, but let's limit it to a reasonable number
         We can set these so they correspond to our more common sizes.
      */

      var styleCrop = function (data, options) {
        var cropDetails;
        if (options.crop === 'original') {
          createStyle('.image[data-image-id="' + options.id + '"]>div', {
            'padding-bottom': ((data.height / data.width) * 100) + '%'
          }, 'image-css-' + options.id);

          cropDetails = {
            x0: 0,
            x1: data.width,
            y0: 0,
            y1: data.height
          };
        } else {
          cropDetails = data.selections[options.crop];
        }

        computeStyle(options.elementDiv, data, cropDetails);
      };

      var styleOriginalCrop = function (data, options) {
        if (options.crop === 'original') {
          //default to 16x9
          createStyle('.image[data-image-id="' + options.id + '"]>div', {
            'padding-bottom': '56.25%', // default to 16x9 for errors
            'background-color': 'rgba(200, 0,0, .5)'
          }, 'image-css-' + options.id);
        }
      };

      var computeStyle = function (element, image, selection) {
        var selector = '.image[data-image-id="' + image.id + '"]>div';
        var elementWidth = $(selector).width();

        var scale;
        var elementHeight = (image.height / image.width) * elementWidth;
        var s_width = selection.x1 - selection.x0;
        var s_height = selection.y1 - selection.y0;
        var tmp_selection = selection;

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

        var imageUrl = CmsConfig.buildImageServerUrl(
          '/' + image.id + '/original/' + CmsConfig.getImageDefaultWidth() + '.jpg'
        );
        scale = elementWidth / s_width;

        var rules = {
          'background-image': 'url(' + imageUrl + ')',
          'background-size': scaleNumber(image.width, scale) + 'px',
          'background-position': '-' + scaleNumber(tmp_selection.x0, scale) + 'px ' +
            '-' + scaleNumber(tmp_selection.y0, scale) + 'px',
          'background-repeat': 'no-repeat'
        };
        createStyle(selector, rules, 'image-css-' + image.id);
      };

      var createStyle = function (selector, rules, styleId) {
        var $existingStyle = $('#' + styleId);

        var $styleNode;
        if ($existingStyle.length > 0) {
          $styleNode = $existingStyle;
        } else {
          $styleNode = $('<style id="' + styleId + '" type="text/css">');
          $(document).find('head').append($styleNode);
        }

        var css = '' + selector + '{';
        for (var rule in rules) {
          css += rule + ':' + rules[rule] + ';';
        }
        css += '}';

        $styleNode.append(css);
      };

      var scaleNumber = function (num, by_scale) {
        return Math.floor(num * by_scale);
      };

      var computeAspectRatio = function (_w, _h) {
        if (_w !== 0 && _h !== 0) {
          var aspectRatio = Math.ceil(_w / _h * 10);
          var crop = 'original';
          //smooth out rounding issues.
          switch (aspectRatio) {
            case 30:
            case 31:
              crop = '3x1';
              break;
            case 20:
              crop = '2x1';
              break;
            case 14:
              crop = '4x3';
              break;
            case 18:
              crop = '16x9';
              break;
            case 8:
              crop = '3x4';
              break;
            case 10:
              crop = '1x1';
              break;
          }
          return crop;
        } else {
          return '16x9';
        }
      };

      this.picturefill = function (element) {
        var $el;
        if (typeof element === 'undefined') {
          $el = $(document);
        } else {
          $el = $(element);
        }

        var $ps;
        if ($el.data('type') === 'image') {
          $ps = $el;
        } else {
          $ps = $el.find('div[data-type="image"]');
        }

        $ps.each(function (i, el) {
          var $imgContainer = $(el);
          var imgId = $imgContainer.data('imageId');

          if (typeof imgId === 'number') {
            var $div = $imgContainer.children('div');
            var currCrop = $imgContainer.attr('data-crop');
            var computedCrop = computeAspectRatio($div.width(), $div.height());
            var isCropChanged = computedCrop !== currCrop;
            // HACK : something causes images to reload if using properties on elmeents
            //  inside the editor
            var isRendered = $('.image-css-' + imgId).length > 0;

            if (!isRendered || isCropChanged) {

              var crop = 'original';
              if (!isRendered) {
                crop = currCrop;
              } else if (isCropChanged){
                crop = computedCrop;
              }

              $.ajax({
                url: CmsConfig.buildImageServerUrl('/api/' + imgId),
                headers: {
                  'X-Betty-Api-Key': CmsConfig.getImageServerApiKey(),
                  'Content-Type': undefined
                }
              })
              .done(function (data) {
                styleCrop(data, {
                  elementDiv: $div[0],
                  id: imgId,
                  crop: crop
                });
              })
              .fail(function (data) {
                styleOriginalCrop(data, {
                  id: imgId,
                  crop: crop
                });
              });
            }
          }
        });
      };

      return this;
    }
  ]);

'use strict';

var ConfigError = function (providerName, message) {
  this.name = 'Configuration Error (' + providerName + ')';
  this.message = message || 'Something was misconfigured.';
};
ConfigError.prototype = Object.create(Error.prototype);
ConfigError.prototype.constructor = window.ConfigError;

'use strict';

angular.module('contentServices.factory', [
  'restangular'
])
  .factory('ContentFactory', function (Restangular) {
// TODO : stupid passthrough until we get rid of restangular
    return Restangular;
  });

'use strict';

angular.module('contentServices.listService', [
 'contentServices.factory'
])
  .service('ContentListService', function (_, $location, $q, ContentFactory) {

    var ContentListService = this;
    // bind data object to service so we can use 2-way data binding
    // WARNING: DO NOT ACCESS THIS DIRECTLY!
    this._serviceData = {
      filters: $location.search() || {},
      content: [],
      totalItems: 0
    };
    // shorthand
    var _data = this._serviceData;

    /**
     * Update filters used for searching content data. Note: this does not actually
     *  update content.
     *
     * @param {object} addFilters - filters to append to current filters.
     * @param {Boolean} [merge=false] - false to overwrite current filters.
     */
    ContentListService.updateFilters = function (addFilters, merge) {
      if (merge) {
        _data.filters =
          _.assign($location.search() || {}, addFilters);
      } else {
        _data.filters = addFilters;
      }
      $location.search(_data.filters);
      return _data.filters;
    };

    /**
    * Update content by performing a search.
    *
    * @param {object} addFilters - filters to append to current filters before search.
    * @param {Boolean} [merge=false] - true to merge query parameters.
    * @returns {Promise} resolves with new content data.
    */
    ContentListService.$updateContent = function (addFilters, merge) {
      var updateParams = ContentListService.updateFilters(addFilters || _data.filters, merge);
      return ContentFactory.all('content').getList(updateParams)
        .then(function (data) {
          _data.content = data;
          _data.totalItems = data.metadata.count;
          // resolve promise with updated content list service data
          return _data;
        });
    };

    /**
     * Access data object, this will have a two-way data binding.
     */
    ContentListService.getData = function () {
      return _data;
    };

  });

'use strict';

angular.module('contentServices', [
  'contentServices.factory',
  'contentServices.listService'
]);

'use strict';

angular.module('copyButton', [])
  .directive('copyButton', function (SHARED_URL) {
    return {
      controller: function ($scope, $timeout) {

        $scope.okCopy = false;
        $scope.okCopyButton = function () {
          $scope.okCopy = true;
          $timeout(function () {
            $scope.okCopy = false;
          }, 1000);
        };
      },
      restrict: 'E',
      scope: {
        buttonClassesDefault: '@',
        buttonClassesSuccess: '@',
        content: '@'
      },
      templateUrl: SHARED_URL + 'copy-button/copy-button.html'
    };
  });

'use strict';

angular.module('currentUser', [
  'contentServices.factory'
])
  .service('CurrentUser', [
    '$q', 'ContentFactory',
    function CurrentUser($q, ContentFactory) {

      var userDeferred;

      this.data = [];

      var self = this;
      this.getItems = function () {
        if (!userDeferred) {
          userDeferred = $q.defer();

          ContentFactory.one('me')
            .get()
            .then(function (data) {
              self.data = data;
              userDeferred.resolve(data);
            })
            .catch(function () {
              userDeferred.reject();
              userDeferred = null;
            });
        }

        return userDeferred.promise;
      };

      /**
       * Get promise that resolves when user data is populated.
       */
      this.$retrieveData = function () {
        return this.getItems();
      };

      /**
       * Create a simplified version of this user for storage.
       */
      this.$simplified = function () {
        return this.getItems()
          .then(function (user) {
            var displayName = user.first_name && user.last_name ?
                                user.first_name + ' ' + user.last_name :
                                  (user.email || user.username);
            return {
              id: user.id,
              displayName: displayName
            };
          });
      };
    }
  ]);

;(function (global) {
  'use strict';

  /**
   * Insert assets from external sources, optionally cache busted.
   */
  global.ExternalAssetLoader = (function () {

    var _checkCacheBust = function (url, cacheBust) {
      return cacheBust ? url + '?' + (new Date()).valueOf() : url;
    };

    var _insert = function (element, type, insertLocation) {
      var firstOfType = insertLocation.querySelectorAll(type);
      insertLocation.insertBefore(element, firstOfType[0]);
    };

    var service = {};

    service.TYPES = {
      STYLE: 'link',
      SCRIPT: 'script'
    };

    service.addAsset = function (optsIn) {
      var element;

      if (typeof optsIn.url !== 'string') {
        throw new Error('ExternalAssetLoader: Must define asset url string to load.');
      } else if (typeof optsIn.type !== 'string') {
        throw new Error('ExternalAssetLoader: Must define an asset type string to load.');
      }

      if (optsIn.type === this.TYPES.STYLE) {
        element = document.createElement(optsIn.type);

        element.href = _checkCacheBust(optsIn.url, optsIn.cacheBust);
        element.rel = 'stylesheet';

        _insert(element, optsIn.type, document.head);
      } else if (optsIn.type === this.TYPES.SCRIPT) {
        element = document.createElement(optsIn.type);

        element.src = _checkCacheBust(optsIn.url, optsIn.cacheBust);

        _insert(element, optsIn.type, document.head);
      }

      return element;
    };

    return service;
  })();
})(window);

'use strict';

angular.module('filters.moment', [
  'moment'
])
  .filter('date_string_to_moment', function(moment) {
    return function (dateStr) {
      // Try to parse non-empty strings
      if (dateStr && dateStr.length) {
        var m = moment(dateStr);
        if (m.isValid()) {
          return m;
        }
      }
      return null;
    };
  })
  .filter('moment_to_date_string', function(moment) {
    return function (momentObj) {
      if (moment.isMoment(momentObj) && momentObj.isValid()) {
        return momentObj.format();
      } else {
        // Blank time string == not set
        return '';
      }
    };
  });

'use strict';

angular.module('filters.userDisplay', [])
  .filter('userDisplay', [
    function () {
      return function (user) {
        var name = '';

        if (user) {
          if (user.full_name) {
            name = user.full_name;
          } else if (user.first_name && user.last_name) {
            name = user.first_name + ' ' + user.last_name;
          } else {
            name = user.username;
          }
        }

        return name;
      };
    }
  ]);

'use strict';

/**
 * Service for authenticating and interacting with the root of this site in firebase.
 */
angular.module('cms.firebase.api', [
  'cms.firebase.config',
  'cms.firebase.refFactory',
  'currentUser'
])
  .service('FirebaseApi', [
    '$q', '$rootScope', 'CurrentUser', 'FirebaseConfig', 'FirebaseRefFactory',
    function ($q, $rootScope, CurrentUser, FirebaseConfig, FirebaseRefFactory) {

      // get root reference in firebase for this site
      var rootRef;
      var connectedRef;
      try {
        rootRef = FirebaseRefFactory.newRef(FirebaseConfig.getSiteDbUrl());
        connectedRef = FirebaseRefFactory.newRef(FirebaseConfig.getConnectionStatusUrl());
      } catch (e) {
        console.warn('Firebase url is invalid, FirebaseApi will prevent firebase from working: ' + e.message);
      }

      // set up a promise for authorization
      var authDefer = $q.defer(),
          $authorize = authDefer.promise;

      // set up catch all for logging auth errors
      $authorize
        .catch(function (error) {
          // if there's an error message log it
          if (error) {
            console.error('Firebase login failed:', error);
          }
        });

      // log current session in when their current user data is available
      if (rootRef) {
        CurrentUser.$retrieveData().then(function (user) {
          // attempt to login if user has firebase token, if they don't auth
          //  promise will reject with no error message which is okay if we're
          //  in an environment where firebase isn't set up yet
          if ('firebase_token' in user && user.firebase_token) {
            // authorize user
            rootRef.auth(user.firebase_token, function (error) {
              if (error) {
                // authorization failed
                authDefer.reject(error);
              } else {
                // authorization success, resolve deferred authorization with rootRef
                authDefer.resolve(rootRef);
              }
            });
          } else {
            // user doesn't have a firebase token, reject authorization without an error message
            authDefer.reject();
          }
        });
      }

      // emit events when firebase reconnects or disconnects, disconnect event
      //  should not be used in place of onDisconnect function provided by
      //  firebase reference objects
      if (connectedRef) {
        connectedRef.on('value', function (connected) {
          if (connected.val()) {
            $rootScope.$emit('firebase-reconnected');
          } else {
            $rootScope.$emit('firebase-disconnected');
          }
          $rootScope.$emit('firebase-connection-state-changed');
        });
      }

      // connection object
      var $connection = {
        onConnect: function (callback) {
          $rootScope.$on('firebase-reconnected', callback);
          return $connection;
        },
        onDisconnect: function (callback) {
          $rootScope.$on('firebase-disconnected', callback);
          return $connection;
        },
        onChange: function (callback) {
          $rootScope.$on('firebase-connection-state-changed', callback);
        }
      };

      return {
        /**
         * Authorization deferred promise that resolves with the root firebase
         *  reference, or rejects with an error message.
         */
        $authorize: function () { return $authorize; },

        /**
         * Provides access to Firebase connection and disconnection event listeners.
         */
        $connection: $connection
      };

    }
  ]);

'use strict';

/**
 * Factory for getting references to articles as they are stored in firebase.
 */
angular.module('cms.firebase.articleFactory', [
  'cms.firebase.api',
  'cms.firebase.config',
  'currentUser',
  'firebase',
  'lodash'
])
  .factory('FirebaseArticleFactory', [
    '_', '$firebase', '$q', '$routeParams', 'CurrentUser', 'FirebaseApi', 'FirebaseConfig', 'moment',
    function (_, $firebase, $q, $routeParams, CurrentUser, FirebaseApi, FirebaseConfig, moment) {

      /**
       * Create a new article.
       *
       * @param rootRef     root reference of firebase db.
       * @param articleId   id of article to create.
       * @return  article object.
       */
      var createArticle = function (rootRef, articleId) {

        var articleRef = rootRef.child('articles/' + articleId),
            $activeUsers = $firebase(articleRef.child('users')).$asArray(),
            $versions = $firebase(articleRef.child('versions')).$asArray();

        var addCurrentUserToActiveUsers = function () {

          var registeredDeferred = $q.defer(),
              registeredPromise = registeredDeferred.promise;

          CurrentUser.$simplified()
            .then(function (user) {

              $activeUsers
                .$add(user)
                .then(function (userRef) {

                  // ensure user is removed on disconnect
                  userRef.onDisconnect().remove();

                  // resolve registration
                  registeredDeferred.resolve(user);

                })
                .catch(function (error) {
                  registeredDeferred.reject(error);
                });

            })
            .catch(function (error) {
              registeredDeferred.reject(error);
            });

          return registeredPromise;

        };

        var registerCurrentUserActive = function () {

          // ensure when reconnection occurs, user is added back to active users
          FirebaseApi.$connection.onConnect(addCurrentUserToActiveUsers);

          // add current user and return promise
          return addCurrentUserToActiveUsers();

        };

        return {

          /**
           * Raw firebase article reference.
           */
          ref: articleRef,
          /**
           * Get angularfire live array of article's currently active users.
           */
          $activeUsers: function () { return $activeUsers; },
          /**
           * Get angularfire live array of article versions.
           */
          $versions: function () { return $versions; },
          /**
           * Register a user as active with this article.
           *
           * @returns   deferred promise that will resolve with the user reference as added to the active user list.
           */
          $registerCurrentUserActive: registerCurrentUserActive,

          /**
           * Create a new version for this article.
           *
           * @param articleData   Content to store in the version.
           * @returns   deferred promise that will resolve with the version reference as added to the versions list.
           *  Promise is rejected if for some reason create did not occur (eg nothing changed since last version).
           */
          $createVersion: function (articleData) {

            // defer for creation of version
            var createDefer = $q.defer(),
                $createPromise = createDefer.promise;

            // get simplified version of user then use that when creating version
            CurrentUser.$simplified().then(function (user) {

              // if we will have more than the max versions allowed, delete until we're one below the max
              var numVersions = $versions.length;
              if (numVersions + 1 > FirebaseConfig.getMaxArticleVersions()) {
                _.chain($versions)
                  // sort oldest to newest
                  .sortBy(function (version) {
                    return version.timestamp;
                  })
                  // remove oldest versions until we're 1 below max versions
                  .every(function (version) {
                    $versions.$remove(version);
                    numVersions--;
                    return numVersions + 1 > FirebaseConfig.getMaxArticleVersions();
                  });
              }

              // make version data
              var versionData = {
                timestamp: moment().valueOf(),
                user: user,
                content: articleData
              };

              // add version to version data
              $versions.$add(versionData)
                .then(createDefer.resolve)
                .catch(createDefer.reject);

            });

            // return promise for this create
            return $createPromise;

          }

        };

      };

      return {

        /**
         * Retrieve an article object that is connected to firebase.
         *
         * @param articleId   id of article to retrieve.
         * @returns   deferred promise that will resolve with the article object.
         */
        $retrieveArticle: function (articleId) {

          var retrieveDeferred = $q.defer(),
              retrievePromise = retrieveDeferred.promise;

          FirebaseApi.$authorize()
            .then(function (rootRef) {
              retrieveDeferred.resolve(createArticle(rootRef, articleId));
            })
            .catch(function (error) {
              retrieveDeferred.reject(error);
            });

          return retrievePromise;

        },
        /**
         * Retrieve current article object that is connected to firebase.
         *
         * @returns   deferred promise that will resolve with the current article object.
         */
        $retrieveCurrentArticle: function () {

          return this.$retrieveArticle($routeParams.id);

        }

      };

    }
  ]);

'use strict';

angular.module('cms.firebase.config', [
  'lodash',
  'utils'
])
  .provider('FirebaseConfig', function (_, UtilsProvider) {
    var config = {};

    // url where firebase db is located
    var dbUrl = '';
    // maximum number of versions of an article to store
    var maxVersions = 25;
    // root of site specific branch of firebase db
    var siteRoot = 'a-site-is-not-configured';

    config.setDbUrl = function (newDbUrl) {
      dbUrl = newDbUrl;
      return config;
    };

    config.setMaxVersions = function (numVersions) {
      maxVersions = numVersions;
      return config;
    };

    config.setSiteRoot = function (newSiteRoot) {
      siteRoot = newSiteRoot;
      return config;
    };

    config.$get = function () {
      return {
        getConnectionStatusUrl: _.constant('https://' + UtilsProvider.path.join(dbUrl, '.info', 'connected')),
        getMaxArticleVersions: _.constant(maxVersions),
        getSiteDbUrl: _.constant(UtilsProvider.path.join(dbUrl, siteRoot))
      };
    };

    return config;
  });

'use strict';

/**
 * Factory for creating new references to firebase.
 */
angular.module('cms.firebase.refFactory', [
  'firebase'
])
  .service('FirebaseRefFactory', [
    'Firebase',
    function (Firebase) {

      return {
        newRef: function (url) {
          return new Firebase(url);
        }
      };
    }
  ]);

angular.module('cms.firebase', [
  'cms.firebase.api',
  'cms.firebase.articleFactory',
  'cms.firebase.config'
]);

'use strict';

/**
 * Use as an attribute to focus on a particular field when given condition is true. For example:
 *
 * <div focus-when="showDiv"/>
 *
 * Will focus on this div when showDiv is true.
 */
angular.module('focusWhen', [])
  .directive('focusWhen', function ($timeout) {
    return {
      restrict: 'A',
      scope: {
        trigger: '=focusWhen'
      },
      link: function (scope, element) {
        scope.$watch('trigger', function (value) {
          if (value) {
            $timeout(function () {
              element[0].focus();
            });
          }
        });
      }
    };
  });

'use strict';

angular.module('listPage', [
  'bulbsCmsApp.settings',
  'confirmationModal',
  'copyButton',
  'lodash'
])
  .directive('listPage', function (SHARED_URL) {
    return {
      controller: function (_, $scope, $location, $parse) {
        $scope.name = $scope.modelFactory.identity();
        $scope.namePlural = $scope.modelFactory.identity(true);
        $scope.fields = $scope.modelFactory.$fieldDisplays();
        $scope.$list = $scope.modelFactory.$collection();

        // different types of filters that get combined to make seach query params
        $scope.orderingFilter = {};
        $scope.searchFilter = {};
        $scope.toggledFilters = {};

        $scope.copyContentInContext = function (record) {
          var value = '';
          if ($scope.toolCopyContent) {
             value = $parse($scope.toolCopyContent)({record: record});
          }
          return value;
        };

        $scope.$retrieve = _.debounce(function (addParams) {
          $scope.loadingResults = true;
          var allParams = _.merge(
            {},
            $scope.orderingFilter,
            $scope.toggledFilters,
            $scope.searchFilter,
            addParams
          );
          return $scope.$list.$refresh(allParams)
            .$then(function () {
              $scope.loadingResults = false;
            });
        }, 250);

        // search functionality
        $scope.$search = function (query) {
          $scope.searchFilter = {};

          if (query) {
            $scope.searchFilter[$scope.searchParameter] = query;
          }

          // go to page 1, new results may not have more than 1 page
          $scope.$list.$page = 1;

          $scope.$retrieve();
        };

        // toggled filters, only one set of these can be applied at a time
        $scope.filterButtonsParsed = $scope.filterButtons();
        $scope.$toggleFilters = function (params) {
          $scope.toggledFilters = params;

          // go to page 1, new results may not have more than 1 page
          $scope.$list.$page = 1;

          $scope.$retrieve();
        };

        // sorting functionality, only one field can be sorted at a time
        $scope.sortingField = null;
        $scope.sortDirection = 'asc';
        $scope.$sort = function (field) {
          var direction;
          if (field.title === $scope.sortingField) {
            // clicked on same field, make direction opposite of what it is now
            direction = $scope.sortDirection === 'desc' ? 'asc' : 'desc';
          } else {
            // clicked on a different field, start with the opposite of default
            direction = 'desc';
          }

          // do ordering request
          (function (field, direction) {
            $scope.orderingFilter = {ordering: field.getOrdering(direction)};
            $scope.$retrieve()
              .$then(function () {
                $scope.sortingField = field.title;
                $scope.sortDirection = direction;
              });
          })(field, direction);
        };

        $scope.$add = function () {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/new/');
        };

        $scope.$remove = function (item) {
          item.$destroy();
        };

        $scope.goToEditPage = function (item) {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/' + item.id + '/');
        };

        // set the active filter, either the first button with active === true,
        //   or empty string for all
        $scope.activeFilterButton =
          _.chain($scope.filterButtonsParsed)
            .findWhere({active: true})
            .tap(function (button) {
              // cheat here and set the params for the first retrieve
              if (button) {
                $scope.toggledFilters = button.params;
              }
            })
            .result('title')
            .value() ||
            '';
        // do initial retrieval
        $scope.$retrieve();
      },
      restrict: 'E',
      scope: {
        cmsPage: '@',
        filterButtons: '&',
        modelFactory: '=',
        searchParameter: '@',
        toolCopyContent: '@'
      },
      templateUrl: SHARED_URL + 'list-page/list-page.html'
    };
  });

'use strict';

angular.module('sponsoredContentModal', [
  'sponsoredContentModal.factory'
])
  .directive('sponsoredContentModalOpener', function (SponsoredContentModal) {
    return {
      restrict: 'A',
      scope: {
        article: '='
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('sponsored-content-modal-opener');
        element.on('click', function () {
          modalInstance = new SponsoredContentModal(scope);
        });
      }
    };
  });

'use strict';

angular.module('sponsoredContentModal.factory', [
  'ui.bootstrap.modal'
])
  .factory('SponsoredContentModal', function ($modal, SHARED_URL) {

    var SponsoredContentModal = function (scope) {
      return (function (scope) {
        $modal
          .open({
            controller: function ($scope, $modalInstance) {
              $scope.confirm = function () {
                $scope.$close();
                $scope.modalOnOk();
              };

              $scope.cancel = function () {
                $scope.$dismiss();
                $scope.modalOnCancel();
              };
            },
            scope: scope,
            templateUrl: SHARED_URL + 'sponsored-content-modal/sponsored-content-modal.html'
          });
      })(scope);
    };

    return SponsoredContentModal;
  });

'use strict';

angular.module('utils', [])
  .provider('Utils', function () {
    var Utils = this;

    Utils.slugify = function (text) {
      // https://gist.github.com/mathewbyrne/1280286
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    };

    /**
     * Content moving function.
     *
     * @param {Number} indexFrom - Index to move content from.
     * @param {Number} indexTo - Index to move content to.
     * @returns {Boolean} true if content moved, false otherwise.
     */
    Utils.moveTo = function (list, indexFrom, indexTo) {
      var ret = false;

      if (indexFrom >= 0 && indexFrom < list.length &&
          indexTo >= 0 && indexTo < list.length) {
        var splicer = list.splice(indexFrom, 1, list[indexTo]);
        if (splicer.length > 0) {
          list[indexTo] = splicer[0];
          ret = true;
        }
      }
      return ret;
    };

    /**
     * Remove an item from a list.
     *
     * @param {List} list - list to remove an item from.
     * @param {Number} index - index of item to remove.
     * @returns {Boolean} true if item was removed from list, false otherwise.
     */
    Utils.removeFrom = function (list, index) {
      return list.splice(index, 1).length > 0;
    };

    Utils.path = {
      /**
       * Join path strings.
       *
       * @param {...String} A variable number of strings to join into path.
       * @returns {String} joined path.
       */
      join: function () {
        var sep = '/';
        var replace = new RegExp(sep + '{1,}', 'g');
        var argsArr = Array.prototype.slice.call(arguments);
        return argsArr.join(sep).replace(replace, sep);
      }
    };

    // allow this to be used anywhere
    this.$get = function () {
      return Utils;
    };
    return this;
  });

'use strict';

angular.module('videoList.video.directive', [
  'bulbsCmsApp.settings',
  'filters.moment'
])
  .directive('videoListVideo', function (SHARED_URL) {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      templateUrl: SHARED_URL + 'video-list/video-list-video/video-list-video.html'
    };
  });

'use strict';

angular.module('videoList', [
  'autocompleteBasic',
  'jquery',
  'videoList.video.directive',
  'ui.sortable',
  'utils',
  'VideohubClient.api',
  'VideohubClient.settings'
])
  .directive('videoList', function ($, SHARED_URL) {
    return {
      controller: function (_, $scope, Utils, Video, VIDEOHUB_DEFAULT_CHANNEL) {

        $scope.videoChannel = VIDEOHUB_DEFAULT_CHANNEL;

        $scope.moveUp = function (index) {
          Utils.moveTo($scope.videos, index, index - 1);
          $scope.onUpdate();
        };

        $scope.moveDown = function (index) {
          Utils.moveTo($scope.videos, index, index + 1);
          $scope.onUpdate();
        };

        $scope.delete = function (index) {
          Utils.removeFrom($scope.videos, index);
          $scope.onUpdate();
        };

        $scope.addVideo = function (video) {
          $scope.addVideoCallback({video: video});
          $scope.onUpdate();
        };

        $scope.searchVideos = function (query) {
          return Video.$postSearch({
            query: query,
            channel: VIDEOHUB_DEFAULT_CHANNEL
          });
        };

      },
      link: function (scope, element, attr) {

        scope.sortableOptions = {
          beforeStop: function (e, ui) {
            ui.helper.css('margin-top', 0);
          },
          change: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          containment: 'video-list',
          distance: 3,
          opacity: 0.75,
          placeholder: 'dropzone',
          start: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          }
        };
      },
      restrict: 'E',
      scope: {
        addVideoCallback: '&addVideo',
        videos: '=',
        onUpdate: '&'
      },
      templateUrl: SHARED_URL + 'video-list/video-list.html'
    };
  });

'use strict';

angular.module('videoSearch', [
  'autocompleteBasic',
  'VideohubClient.api',
  'VideohubClient.settings'
])
  .directive('videoSearch', [
    'SHARED_URL',
    function (SHARED_URL) {
      return {
        restrict: 'E',
        templateUrl: SHARED_URL + 'video-search/video-search.html',
        scope: {
          video: '='
        },
        controller: [
          '$scope', 'Video', 'VIDEOHUB_DEFAULT_CHANNEL',
          function ($scope, Video, VIDEOHUB_DEFAULT_CHANNEL) {
            $scope.videoChannel = VIDEOHUB_DEFAULT_CHANNEL;
            $scope.searchVideos = function (query) {
              return Video.$postSearch({
                query: query,
                channel: VIDEOHUB_DEFAULT_CHANNEL
              });
            };
          }
        ]
      };
    }
  ]);

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
  .directive('addImage', function ($http, $window, PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'add-image.html',
      scope: {
        article: '='
      },
      link: function (scope, element, attrs) {
        var attrName = attrs.attrName || 'images';
        scope.article[attrName] = scope.article[attrName] || [];

        if (attrs.caption === 'false') { scope.hideCaption = true; }
        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';
        scope.placeholderText = attrs.placeholderText || 'Optional Image';

        scope.addAnImage = function () {
          $window.uploadImage({
            onSuccess: function (data) {
              scope.$apply(function () {
                scope.article[attrName].push({
                  id: data.id.toString(),
                  alt: null,
                  caption: null
                });
                setTimeout($window.picturefill, 200);
              });
            },
            onError: function (data) {
              scope.$apply(function () {
                $window.alert('Error: ', data);
              });
            },
            onProgress: function (data) {

            }
          });
        };
      }

    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function (PARTIALS_URL, LOADING_IMG_SRC) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'promotion-tool-article-container.html',
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
        scope.ratio = attrs.ratio;
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('bulbsAutocomplete', function ($http, $location, $compile, $timeout,
      $, Raven, CmsConfig) {

    var autocomplete_dropdown_template =
      '<div class="autocomplete dropdown" ng-show="autocomplete_list">' +
          '<div class="entry" ng-repeat="option in autocomplete_list" ng-click="onClick(option)">' +
              '{{display(option);}}' +
          '</div>' +
      '</div>';

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
  .directive('cmsNotification', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'cms-notification.html',
      scope: {
        notification: '='
      },
      controller: 'CmsNotificationCtrl'
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('cmsNotifyContainer', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: PARTIALS_URL + 'cms-notify-container.html',
      controller: 'CmsNotifyContainerCtrl'
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('contributorField', [
    '$', 'PARTIALS_URL', 'Utils',
    function ($, PARTIALS_URL, Utils) {
      return {
        templateUrl: Utils.path.join(
          PARTIALS_URL,
          'textlike-autocomplete-field.html'
        ),
        restrict: 'E',
        replace: true,
        scope: {
          override: '='
        },
        link: function postLink(scope, element, attrs) {
          scope.name = 'contributor';
          scope.label = 'Contributors';
          scope.placeholder = 'Contributors';
          scope.resourceUrl = '/cms/api/v1/author/?ordering=name&search=';

          scope.$watch('override.contributor', function () {
            if ((scope.override.hasOwnProperty('contributor')) && (scope.override.contributor !== null)) {
              scope.model = scope.override.contributor.full_name || scope.override.contributor.fullName;
            }
          });

          scope.display = function (o) {
            return (o && o.full_name) || '';
          };

          scope.add = function(o, input) {
            if ((scope.override.hasOwnProperty('contributor')) && scope.override.contributor !== null) {
              if (scope.override.contributor.id === o.id) {
                return;
              }
            }

            scope.override.contributor = o;
            $('#feature-type-container').removeClass('newtag');
            $('#feature-type-container').addClass('newtag');
          };

          scope.delete = function (e) {
            scope.override.contributor = null;
            scope.model = null;
          };

        }
      };
    }
  ]);

'use strict';

angular.module('bulbsCmsApp')
  .directive('createContent', function ($http, $window, $, IfExistsElse, ContentFactory,
      AUTO_ADD_AUTHOR, Raven, CmsConfig) {

    return {
      restrict: 'E',
      templateUrl: CmsConfig.getCreateContentTemplateUrl,
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

        $scope.newArticle = function (e) {
          var init = {'title': $scope.newTitle};
          angular.extend($scope.init, init);

          if ($scope.tag) {
            IfExistsElse.ifExistsElse(
              ContentFactory.all('tag').getList({
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
            ContentFactory.one('me').get().then(function (data) {
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
            url: CmsConfig.buildBackendApiUrl('content/?doctype=' + $scope.contentType),
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
                .html('<i class="fa fa-exclamation-triangle"></i> Please Log In');
            } else {
              $('button.go').removeClass('btn-success').addClass('btn-danger').html('<i class="fa fa-times"></i> Error');
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
            e.preventDefault();

            $('#create button.next-pane').click();
            return false;
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

/**
 * Directive to apply as an attribute to an element, that when clicked, will open a datetime selection modal. Modal
 *  functionality is dependent on all dates being moment objects.
 */
angular.module('bulbsCmsApp')
  .directive('datetimeSelectionModalOpener', function ($modal, PARTIALS_URL) {
    return {
      restrict: 'A',
      scope: {
        modDatetime: '=?ngModel',
        modalTitle: '@',
        modalOnClose: '&'
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('datetime-selection-modal-opener');
        element.on('click', function () {
          modalInstance = $modal
            .open({
              templateUrl: PARTIALS_URL + 'modals/datetime-selection-modal.html',
              controller: 'DatetimeSelectionModalCtrl',
              scope: scope
            });
          modalInstance.result
            .then(function (newDate) {
              scope.modDatetime = newDate;
              scope.modalOnClose({newDate: newDate});
            });
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('devicepreview', function ($, PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'devicepreview.html',
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
  .directive('onionEditor', function (PARTIALS_URL, $, Zencoder, BettyCropper,
      openImageCropModal, VIDEO_EMBED_URL, OnionEditor, CmsImage, CmsConfig) {
    return {
      require: 'ngModel',
      replace: true,
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'editor.html',
      scope: {
        ngModel: '='
      },
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
            inlineObjects: CmsConfig.getInlineObjectsUrl(),
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
        } else {
          $('.document-tools, .embed-tools', element).hide();
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
          CmsImage.picturefill(element);
          editor.setChangeHandler(read);
        };

        // Redefine what empty looks like
        ngModel.$isEmpty = function (value) {
          return ! value || editor.scribe.allowsBlockElements() && value === defaultValue;
        };

        // Write data to the model
        var read = function () {
          var html = editor.getContent();
          if (html === defaultValue) {
            html = '';
          } else {
            CmsImage.picturefill(element);
          }
          ngModel.$setViewValue(html);
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('encodeStatus', function ($http, $interval, $, Zencoder, PARTIALS_URL) {
    return {
      templateUrl: PARTIALS_URL + 'encode-status.html',
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
          var updateEncodeStatus = function (i) {
            return (function (videoid) {
              if (Zencoder.encodingVideos[videoid].encode_status_endpoints &&
                  Zencoder.encodingVideos[videoid].encode_status_endpoints.json) {

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
          };

          for (var i in Zencoder.encodingVideos) {
            if (scope.encodingVideos[i] && scope.encodingVideos[i].finished) {
              continue;
            }
            scope.encodingVideos[i] = Zencoder.encodingVideos[i];
            updateEncodeStatus(i);
          }
        }

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('featuretypeField', function (PARTIALS_URL, IfExistsElse, ContentFactory,
      Raven, $, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'textlike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '=',
        hideLabel: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'feature_type';
        scope.label = 'Feature Type';
        scope.placeholder = 'Feature Type';
        scope.resourceUrl = CmsConfig.buildBackendApiUrl('things/?type=feature_type&q=');

        scope.$watch('article.feature_type', function () {
          scope.model = scope.article.feature_type;
        });

        scope.display = function (o) {
          return (o && o.name) || '';
        };

        scope.add = function (o, input, freeForm) {
          var fVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentFactory.all('things').getList({
              type: 'feature_type',
              q: fVal
            }),
            {
              name: fVal
            },
            function (ft) {
              scope.article.feature_type = ft.name;
              $('#feature-type-container').removeClass('newtag');
            },
            function (value) {
              scope.article.feature_type = value.name;
              $('#feature-type-container').addClass('newtag');
            },
            function (data, status) {
              Raven.captureMessage('Error Adding Feature Type', {extra: data});
            }
          );
        };

        scope.delete = function (e) {
          scope.article.feature_type = null;
        };

      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('hideIfForbidden', function ($http, CmsConfig) {
    function hideElement(element) {
      element.addClass('hidden');
    }

    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        $http({
          method: 'OPTIONS',
          url: CmsConfig.buildBackendApiUrl(attrs.optionsUrl),
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

angular.module('bulbsCmsApp')
  .directive('lazyInclude', function (PARTIALS_URL, $, $compile, $q, $http,
      $templateCache, Gettemplate) {
    /*
      this is like ng-include but it doesn't compile/render the included template
      until the child element is visible
      intended to help with responsiveness by cutting down requests and rendering time
    */

    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attrs) {
        var templateUrl = PARTIALS_URL + attrs.template;
        var $element = $(element);

        scope.$evalAsync(function () {
          scope.$watch(function () {
            return $element.is(':visible');
          }, function (visible) {
            if (visible && !scope.loaded) {
              scope.loaded = true;
              Gettemplate.get(templateUrl).then(function (html) {
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
  .directive('loggedInUser', function (PARTIALS_URL, CurrentUser, CmsConfig) {
    return {
      controller: function ($scope) {
        CurrentUser.$simplified().then(function (user) {
          $scope.user = user;
        });
        $scope.logout = CmsConfig.logoutCallback;
      },
      restrict: 'E',
      replace: true,
      templateUrl: PARTIALS_URL + 'logged-in-user.html',
      scope: {}
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('navBar', [
    'CmsConfig', 'PARTIALS_URL', 'CurrentUser',
    function (CmsConfig, PARTIALS_URL, CurrentUser) {
      var defaultView = PARTIALS_URL + 'nav.html';

      return {
        controller: 'ContentworkflowCtrl',
        restrict: 'E',
        scope: false,
        templateUrl: function (tElement, tAttrs) {
          var template = defaultView;
          if ('view' in tAttrs) {
            try {
              template = CmsConfig.getToolbarTemplateUrl(tAttrs.view);
            } catch (e) {
              console.error(e);
            }
          }
          return template;
        },
        link: function (scope) {
          scope.NAV_LOGO = CmsConfig.getLogoUrl();
          scope.current_user = CurrentUser;
        }
      };
    }
  ]);

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
  .directive('roleField', [
    '$http', 'PARTIALS_URL', 'Raven', 'Utils',
    function ($http, PARTIALS_URL, Raven, Utils) {
      return {
        templateUrl: Utils.path.join(PARTIALS_URL, 'rolefield.html'),
        restrict: 'E',
        replace: true,
        scope: {
          model: '='
        },

        link: function (scope, element, attrs) {
          var resourceUrl = '/cms/api/v1/contributions/role/';

          scope.roleValue = null;
          scope.roleOptions = [];

          scope.$watch('model.role', function () {
            for (var i = 0; i < scope.roleOptions.length; i++) {
              if (scope.roleOptions[i].id === Number(scope.roleValue)) {
                scope.model.role = scope.roleOptions[i];
              }
            }
            scope.roleValue = scope.model.role.id;
          });

          $http({
            method: 'GET',
            url: resourceUrl
          }).success(function (data) {
            scope.roleOptions = data.results || data;
          }).error(function (data, status, headers, config) {
            Raven.captureMessage('Error fetching Roles', {extra: data});
          });
        }
      };
    }
  ]);

'use strict';

angular.module('bulbsCmsApp')
  .directive('saveButtonOld', function ($q, $timeout, $window, PARTIALS_URL) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'save-button.html',
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
              idle: '<i class=\'fa fa-floppy-o\'></i> Save',
              busy: 'Saving',
              finished: 'Saved',
              error: 'Error'
            };
          }
        });

        scope.save = function () {
          if (attrs.confirmClickWith) {
            var message = attrs.confirmClickWith;
            if (!$window.confirm(message)) { return; }
          }

          scope.colors = scope.colors_tmp;
          element
            .prop('disabled', true)
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var save_promise = scope.getPromise();

          var saveSuccess = function (result) {
            scope.colors = scope.colors_tmp;
            element
              .prop('disabled', false)
              .html('<i class=\'fa fa-check\'></i> ' + scope.config.finished);

            return $timeout(function () {
              element.html(scope.config.idle);
            }, 1000)
            .then(function () {
              return result;
            });
          };

          if (save_promise) {
            var promise = save_promise
            .then(saveSuccess)
            .catch(
              function (reason) {
                scope.colors = 'btn-danger';
                element
                  .prop('disabled', false)
                  .html('<i class=\'fa fa-times\'></i> ' + scope.config.error);

                return $q.reject(reason);
              });
            if (scope.saveCbk) {
              scope.saveCbk({promise: promise});
            }
          } else {
            // no save promise was set, just run success function
            saveSuccess();
          }
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('slideshowPane', function ($http, $window, $compile, $, LOADING_IMG_SRC,
      PARTIALS_URL, CmsImage) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'slideshow-pane.html',
      scope: {
        article: '=',
        image: '=',
        index: '='
      },
      link: function (scope, element, attrs) {
        var $element = $(element);

        if (attrs.caption === 'false') {
          scope.hideCaption = true;
        }

        scope.format = attrs.format || 'jpg';
        scope.crop = attrs.crop || '16x9';

        scope.removeImage = function (index) {
          scope.article.slides.splice(index, 1);
        };

        scope.editImage = function (index) {
          $window.openImageDrawer(
            scope.article.slides[index].id,
            function (data) {
              function removeLoadingGif() {
                $element.find('.image img[src=\"' + LOADING_IMG_SRC + '\"]').remove();
              }

              removeLoadingGif();

              if ($element.find('.image').data('imageId') === data.id) {
                return;
              }

              $element.find('.image img').on('load', removeLoadingGif);
              $element.find('.image img').after('<img src=\"' + LOADING_IMG_SRC + '\">');

              scope.article.slides[index].id = data.id.toString();
              scope.$apply();
              CmsImage.picturefill();
              if ($element.find('.image img')[0].complete) { removeLoadingGif(); }
            },
            function () { return; },
            function (oldImage) {
              scope.article.slides[index] = oldImage;
              CmsImage.picturefill();
            }
          );
        };
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('staticImage', function (PARTIALS_URL, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'static-image.html',
      restrict: 'E',
      scope: {
        'image': '='
      },
      link: function postLink(scope, element, attrs) {
        var ratio = attrs.ratio || '16x9';

        scope.$watch('image', function () {
          if (scope.image && scope.image.id) {
            scope.imageUrl =
              CmsConfig.buildImageServerUrl(
                '/' + scope.image.id + '/' + ratio + '/' + CmsConfig.getImageDefaultWidth() + '.jpg'
              );
          } else {
            scope.imageUrl = false;
          }
        });
      }
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('tagsField', function (PARTIALS_URL, _, IfExistsElse, ContentFactory,
      Raven, $, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'taglike-autocomplete-field.html',
      restrict: 'E',
      scope: {
        article: '='
      },
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.name = 'tag';
        scope.label = 'Tags';
        scope.placeholder = 'Enter a tag';
        scope.resourceUrl = CmsConfig.buildBackendApiUrl('tag/?ordering=name&types=content_tag&search=');
        scope.display = function (o) {
          return o.name;
        };

        scope.$watch('article.tags', function () {
          scope.objects = _.where(scope.article.tags, {type: 'content_tag'});
        }, true);

        scope.add = function (o, input, freeForm) {
          var tagVal = freeForm ? o : o.name;
          IfExistsElse.ifExistsElse(
            ContentFactory.all('tag').getList({
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
  .directive('targeting', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'targeting.html',
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

angular.module('bulbsCmsApp').directive(
  'videoUpload',
  function ($http, $window, $timeout, $sce, $, PARTIALS_URL, CmsConfig) {
    return {
      templateUrl: PARTIALS_URL + 'mainvideo.html',
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
              url: CmsConfig.buildBackendApiUrl('videos/api/video/' + scope.article.video + '/')
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
  .directive('autocompleteMenu', function ($timeout, $animate, $compile) {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      controller: angular.noop,
      scope: {
        items: '=items',
        pIndex: '=index',
        select: '&select',
      },
      link: function ($scope, element, attrs) {

        $scope.selectItem = function (index) {
          $scope.select(index);
        };

        $scope.setIndex = function (index) {
          $scope.index = index;

          if (attrs.index) {
            $scope.pIndex = parseInt(index, 10);
          }
        };

        if (attrs.index) {
          $scope.$watch('pIndex', function(value){
            $scope.index = parseInt(value, 10);
          });
        }

        $scope.label = function(index) {
          var viewValue = $scope.items[index][attrs.labelAttr];
          if (typeof(viewValue) === 'function') {
            viewValue = viewValue();
          }
          return viewValue;
        };

      },
      template: '<ul class="autocomplete-menu" ng-show="items.length !== 0"><li ng-repeat="item in items" ng-click="select($index)" ng-class="{\'active\': $index == index}" ng-mouseenter = "setIndex($index)"><span>{{ label($index) }}</span></li></ul>'
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .directive('autocomplete', function ($timeout, $animate, $compile, PARTIALS_URL) {
    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      transclude: true,
      controller: function ($scope, $element, $attrs, $injector) {
        $scope.service = $injector.get($attrs.service);
        $scope.placeholder = $attrs.placeholder || '';
      },
      link: function ($scope, element, attrs, ngModel, transclude) {

        var isMenuAppended = false;
        var inputEl = element.find('input');
        var timeoutId = null;

        ngModel.$render = function() {
          if (ngModel.$viewValue) {
            var viewValue = ngModel.$viewValue[attrs.labelAttr];
            if (typeof(viewValue) === 'function') {
              viewValue = viewValue();
            }
            element.find('input').val(viewValue);
            inputEl.attr('disabled', 'disabled');
          }
        };

        $scope.openMenu = function(e) {
          inputEl.removeAttr('disabled');
          inputEl[0].focus();
        };

        inputEl.on('blur keyup change', function() {
          if (inputEl.attr('disabled') !== undefined) {
            return;
          }
          appendMenu();
          var value = inputEl.val();
          if (value) {
            if (timeoutId) {
              $timeout.cancel(timeoutId);
            }
            timeoutId = $timeout(function(){
              queryData(value);
            }, 150);
          }
        });

        var menuScope = $scope.$new();
        menuScope.items = [];
        menuScope.index = 0;
        menuScope.select = function(index) {
          ngModel.$setViewValue(menuScope.items[index]);
          reset();
        };

        var menuEl = angular.element(document.createElement('autocomplete-menu'));
        menuEl.attr({
          'items': 'items',
          'select': 'select(index)',
          'index': 'index',
          'label-attr': attrs.labelAttr,
        });
        transclude(menuScope, function(clone){
          menuEl.append(clone);
        });
        $compile(menuEl)(menuScope);

        element.find('input').on('keyup', function(e) {
          switch(e.which) {
            case 27: // ESC
              if (inputEl.val() === '') {
                reset();
              } else {
                inputEl.val('');
              }
              break;
            case 40: // DOWN
              $scope.$apply(function() {
                menuScope.index = (menuScope.index + 1) % menuScope.items.length;
              });
              break;
            case 38: // UP
              $scope.$apply(function() {
                if(menuScope.index) {
                  menuScope.index = menuScope.index - 1;
                } else {
                  menuScope.index = menuScope.items.length - 1;
                }
              });
              break;
            case 13: // RETURN
              if (menuScope.index >= 0) {
                ngModel.$setViewValue(menuScope.items[menuScope.index]);
                reset();
              }
              break;
            default:
              return;
          }
        });

        function queryData(query) {
          var searchParams = {};
          searchParams[attrs.searchParam || 'search'] = query;
          $scope['service'].getList(searchParams).then(function (results) {

            if(results.length > 5) {
              menuScope.items = results.slice(0, 5);
            } else {
              menuScope.items = results;
            }
            timeoutId = null;
          });
        }

        function appendMenu() {
          if (!isMenuAppended) {
            isMenuAppended = true;
            menuScope.index = 0;
            $animate.enter(menuEl, element.parent(), element);
          }
          styleMenu();
        }

        function reset() {
          ngModel.$render();
          menuScope.items = [];
          menuScope.index = 0;
          $animate.leave(menuEl).finally(function() {
            isMenuAppended = false;
          });
        }

        function styleMenu() {
          var offset = element.offset();

          offset.left = 'auto';
          offset.right = 'auto';
          offset.top = element.outerHeight();
          offset.minWidth = element.outerWidth();

          angular.forEach(offset, function (value, key) {
            if (!isNaN(value) && angular.isNumber(value)) {
              value = value + 'px';
            }
            menuEl[0].style[key] = value;
            menuEl.css('z-index', 1000);
          });
        }
      },
      templateUrl: PARTIALS_URL + 'autocomplete.html'
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('BadrequestmodalCtrl', function ($scope, $modalInstance, detail) {
    $scope.detail = detail;
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ChangelogmodalCtrl', function ($scope, $modalInstance, _, ContentFactory, article) {
    $scope.article = article;
    $scope.users = {};

    ContentFactory.all('log').getList({content: article.id}).then(function (data) {
      $scope.changelog = data;

      var userIds = _.unique(_.pluck(data, 'user'));
      var resp = function (data) {
        $scope.users[data.id] = data;
      };

      for (var i in userIds) {
        ContentFactory.one('author', userIds[i]).get().then(resp);
      }
    });

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    var valid = function () {
      $scope.postDateValid = $scope.postDate && (!$scope.notifyEndDate || $scope.postDate < $scope.notifyEndDate);
      $scope.notifyEndDateValid = $scope.notifyEndDate && $scope.postDate && $scope.notifyEndDate > $scope.postDate;
      $scope.titleValid = $scope.notification.title && $scope.notification.title.length > 0 && $scope.notification.title.length <= 110;

      $scope.notificationValid = $scope.postDateValid && $scope.notifyEndDateValid && $scope.titleValid;
    };

    // Note: use middle man for handling dates since a bug in angular.js version causes moment to not work with
    //  angular.copy. So instead of keeping notification dates as moments, keep them as strings and use moment objects
    //  for interactions.

    $scope.postDate = $scope.notification.post_date ? moment($scope.notification.post_date) : null;
    $scope.$watch('postDate', function () {
      if ($scope.postDate) {
        // set notification's post date as the string version of the moment object
        $scope.notification.post_date = $scope.postDate.format();
        // automatically set the notify end date as 3 days after post date
        $scope.notifyEndDate = $scope.postDate.clone().add({days: 3});
      } else {
        $scope.notification.post_date = null;
      }
    });

    $scope.notifyEndDate = $scope.notification.notify_end_date ? moment($scope.notification.notify_end_date) : null;
    $scope.$watch('notifyEndDate', function () {
      if ($scope.notifyEndDate) {
        // set notification's post date as the string version of the moment object
        $scope.notification.notify_end_date = $scope.notifyEndDate.format();
      } else {
        $scope.notification.notify_end_date = null;
      }
    });

    // keep track of changes to this notification
    $scope.notificationDirty = false;
    $scope.$watch('notification', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
        $scope.notificationDirty = true;

        // do some validation here
        valid();

      }
    }, true);

    // do initial validation
    valid();

    /**
     * Save this notification using the parent scope.
     */
    $scope.saveNotification = function () {

      if ($scope.$parent.userIsSuperuser && $scope.notificationDirty && $scope.notificationValid) {

        $scope.$parent.$saveNotification($scope.notification)
          .then(function (newNotification) {
            $scope.notification = newNotification;
            $scope.notificationDirty = false;
          })
          .catch(function (error) {
            console.log('Notification save failed', error);
          });

      }

    };

    /**
     * Delete this notification using the parent scope.
     */
    $scope.deleteNotification = function () {

      if ($scope.$parent.userIsSuperuser) {

        $scope.$parent.$deleteNotification($scope.notification)
          .catch(function (error) {
            console.log('Notification delete failed', error);
          });

      }

    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationsCtrl', function ($q, $window, $scope, CMS_NAMESPACE, CmsNotificationsApi, CurrentUser, _, moment) {

    // set title
    $window.document.title = CMS_NAMESPACE + ' | Notifications';

    // get user info
    CurrentUser.$retrieveData().then(function (user) {
      if (user.is_superuser) {
        $scope.userIsSuperuser = true;
      }

      // get list of notifications
      CmsNotificationsApi.getList().then(function (notifications) {
        // filter out notifications for regular users that have a post date in the future
        var removeIndicies = [];
        _.each(notifications, function (notification, i) {
          if (!user.is_superuser && moment(notification.post_date).isAfter(moment())) {
            removeIndicies.push(i);
          }
        });
        _.each(removeIndicies, function (i) {
          notifications.splice(i, 1);
        });

        $scope.notifications = notifications;
      });
    });

    /**
     * Create a new notification, plain old object since we don't want to save invalid objects to the db.
     *
     * @return  new notification with only nulled date properties.
     */
    $scope.newNotification = function () {

      var notification = {
        post_date: null,
        notify_end_date: null
      };

      $scope.notifications.unshift(notification);

      return notification;

    };

    /**
     * Save given notification to the database.
     *
     * @param notification  Notification to save.
     * @return  promise that resolves when notification is saved.
     */
    $scope.$saveNotification = function (notification) {

      var saveDefer = $q.defer(),
          savePromise = saveDefer.promise;

      if ($scope.userIsSuperuser) {
        if ('id' in notification) {
          // this thing already exists, update it
          notification.put().then(function (updatedNotification) {
            saveDefer.resolve(updatedNotification);
          });
        } else {
          // a new notification, post it to the list
          $scope.notifications.post(notification)
            .then(function (newNotification) {
              // save succeeded, replace notification with restangularized notification
              var i = $scope.notifications.indexOf(notification);
              $scope.notifications[i] = newNotification;
              saveDefer.resolve(newNotification);
            })
            .catch(function (error) {
              saveDefer.reject(error);
            });
        }
      } else {
        saveDefer.reject('Insufficient permissions.');
      }

      return savePromise;

    };

    /**
     * Delete given notification from the database.
     *
     * @param notification  Notification to delete.
     * @return  promise that resolves when notification is deleted.
     */
    $scope.$deleteNotification = function (notification) {

      var deleteDefer = $q.defer(),
          deletePromise = deleteDefer.promise,
          removeFromList = function (index) {
            $scope.notifications.splice(index, 1);
            deleteDefer.resolve();
          };

      if ($scope.userIsSuperuser) {
        // find notification in list
        var i = $scope.notifications.indexOf(notification);
        if (i > -1) {
          // notification in list, check if it is a restangular object and has a remove function
          if (_.isFunction(notification.remove)) {
            // has remove, call it and resolve promise
            notification.remove()
              .then(function () {
                removeFromList(i);
              })
              .catch(function (error) {
                deleteDefer.reject(error);
              });
          } else {
            // does not have remove, this is a previously unsaved notification, just remove it from list
            removeFromList(i);
          }
        } else {
          deleteDefer.reject('Cannot find notification in notification list. Unable to delete.');
        }
      } else {
        deleteDefer.reject('You do not have sufficient permissions to delete a notification.');
      }

      return deletePromise;

    };

  });

'use strict';

// note: this jshint exception is for URLify, which is just a function not a constructor
/* jshint newcap: false */

/**
 * Controller for notifications bar that is displayed to users.
 */
angular.module('bulbsCmsApp')
  .controller('CmsNotifyContainerCtrl', function ($scope, ipCookie, moment, CmsNotificationsApi, URLify, _) {

    var genCookieKey = function (id) {
      return 'dismissed-cms-notification-' + id;
    };
    var updateNotificationsDisplay = function (notifications) {
      var now = moment();
      $scope.notifications = _.filter(notifications, function (notification) {
        // show notifications where there is no dismiss cookie and post_date < now < notify_end_date
        if (!ipCookie(genCookieKey(notification.id)) &&
              moment(notification.post_date).isBefore(now) &&
              moment(notification.notify_end_date).isAfter(now)) {
          return true;
        }
      });
    };

    // show notifications
    CmsNotificationsApi.getList().then(function (notifications) {
      updateNotificationsDisplay(notifications);
    });

    $scope.dismissNotification = function (notification) {
      // add dismiss cookie
      var cookieKey = URLify(genCookieKey(notification.id));
      ipCookie(cookieKey, true, {
        expires: moment(notification.notify_end_date).add({days: 1}).diff(moment(), 'days'),
        path: '/cms/app'
      });

      // hide notification
      updateNotificationsDisplay($scope.notifications);
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentlistCtrl', function (
    $scope, $http, $timeout, $location,
    $window, $q, $, ContentListService,
    LOADING_IMG_SRC, CMS_NAMESPACE)
  {
    $scope.contentData = [];
    ContentListService.$updateContent({page: 1})
      .then(function (data) {
        $scope.contentData = data;
      });

    $scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
    //set title
    $window.document.title = CMS_NAMESPACE + ' | Content';

    $scope.pageNumber = $location.search().page || '1';
    $scope.myStuff = false;
    $scope.search = $location.search().search;
    $scope.collapse = {};

    $scope.goToPage = function () {
      ContentListService.$updateContent({page: $scope.pageNumber}, true);
    };

    $scope.publishSuccessCbk = function (data) {
      var i;
      for (i = 0; i < $scope.contentData.content.length; i++) {
        if ($scope.contentData.content[i].id === data.article.id) {
          break;
        }
      }

      for (var field in data.response) {
        $scope.contentData.content[i][field] = data.response[field];
      }

      return $q.when();
    };

    $scope.trashSuccessCbk = function () {
      $timeout(function () {
        ContentListService.$updateContent();
        $('#confirm-trash-modal').modal('hide');
      }, 1500);
    };

    $('body').on('shown.bs.collapse', '.panel-collapse', function (e) {
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
  .controller('ContentworkflowCtrl', function ($scope, $http, $modal, $window, moment,
                                               VersionBrowserModalOpener, TemporaryUrlModalOpener,
                                               TIMEZONE_NAME, PARTIALS_URL) {
    $scope.TIMEZONE_LABEL = moment.tz(TIMEZONE_NAME).format('z');

    $scope.trashContentModal = function (articleId) {
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/confirm-trash-modal.html',
        controller: 'TrashcontentmodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function () {
            return articleId;
          }
        }
      });
    };

    $scope.pubTimeModal = function (article) {
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/publish-date-modal.html',
        controller: 'PubtimemodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.changelogModal = function (article) {
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/changelog-modal.html',
        controller: 'ChangelogmodalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.thumbnailModal = function (article) {
      // open thumbnail modal along with its controller
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/thumbnail-modal.html',
        controller: 'ThumbnailModalCtrl',
        scope: $scope,
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.sponsorModal = function (article) {
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/sponsor-modal.html',
        scope: $scope,
        controller: 'SponsormodalCtrl',
        resolve: {
          article: function () { return article; }
        }
      });
    };

    $scope.versionBrowserModal = function (article) {
      VersionBrowserModalOpener.open($scope, article);
    };

    $scope.temporaryUrlModal = function (article) {
      TemporaryUrlModalOpener.open($scope, article);
    };

    $scope.descriptionModal = function (article) {
      return $modal.open({
        templateUrl: PARTIALS_URL + 'modals/description-modal.html',
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
  .controller('ContributionsCtrl', function ($scope, $routeParams, $http, $window,
    $location, $timeout, $compile, $q, $modal, _, ContributionRoleService, ContentService,
    CmsConfig)
  {

    $scope.NAV_LOGO = CmsConfig.getLogoUrl();
    $scope.contentId = parseInt($routeParams.id, 10);
    $scope.paymentType = '';
    $scope.contributions = [];
    $scope.contributionLabels = [];
    $scope.roles = [];
    $scope.collapsed = [];
    $scope.page = 'contributions';

    $scope.clean = true;

    $scope.save = save;
    $scope.add = add;
    $scope.remove = remove;
    $scope.updateLabel = updateLabel;

    $scope.isFlatRate = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Flat Rate'){
          return true;
        }
      }

      return false;
    };

    $scope.isFeatureType = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'FeatureType'){
          $scope.setFeatureRate(contribution);
          return true;
        }
      }

      return false;
    };

    $scope.setFeatureRate = function(contribution) {
      for (var i in contribution.roleObject.rates.feature_type) {
        var featureTypeRate = contribution.roleObject.rates.feature_type[i];
        if ($scope.content.feature_type === featureTypeRate.feature_type) {
          contribution.featureTypeRate = featureTypeRate.rate;
        }
      }
    };

    $scope.isHourly = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Hourly') {
          return true;
        }
      }

      return false;
    };

    $scope.isManual = function(contribution) {
      if (contribution.hasOwnProperty('roleObject')) {
        if (contribution.roleObject.payment_type === 'Manual') {
          return true;
        }
      }

      return false;
    };

    $scope.getHourlyPay = function (contribution) {
      if (contribution.roleObject) {
        if (!contribution.roleObject.rate) {
          return 0;
        }
        return ((contribution.roleObject.rate/60) * (contribution.minutes_worked || 0));
      }
    };

    function save() {
      // I know, I'm not supposed to do DOM manipulation in controllers. TOO BAD.
      angular.element('#save-btn').html('<i class="fa fa-refresh fa-spin"></i> Saving');
      $scope.contributions.save($scope.contributions).then(function (contributions) {
        angular.element('#save-btn').addClass('btn-success').removeClass('btn-danger');
        angular.element('#save-btn').html('<i class="fa fa-floppy-o"></i> Save</button>');
        $scope.clean = true;
      }, function(res) {
        angular.element('#save-btn').addClass('btn-danger').removeClass('btn-success');
        angular.element('#save-btn').html('<i class="fa fa-times"></i> Error</button>');
      });
    }

    function add() {
      $scope.contributions.push({
        contributor: null,
        content: $scope.contentId,
        rate: {
          rate: 0
        },
        role: null
      });
      $scope.collapsed.push(false);
    }

      $scope.$watch('contributions', function(newContributions, oldContributions) {
        if (oldContributions.length > 0) {
          $scope.clean = false;
        }
      }, true);

    function getRoles() {
      return ContributionRoleService.getList().then(function (roles) {
        $scope.roles = roles;
        getContributions();
      });
    }

    function getContributions() {
      return ContentService.one($scope.contentId).all('contributions').getList().then(function (contributions) {
        for (var i in contributions) {
          if (contributions[i] === null || contributions[i].role === undefined) {
            continue;
          } else {

            if ((contributions[i].hasOwnProperty('rate')) &&
                (typeof(contributions[i].rate) === 'object') &&
                (contributions[i].rate !== null)) {
              contributions[i].rate = contributions[i].rate.rate;
            }

            if (typeof(contributions[i].role) === 'object') {
              contributions[i].paymentType = contributions[i].role.payment_type;
              contributions[i].roleObject = contributions[i].role;
              contributions[i].role = contributions[i].role.id;
            }
          }
        }
        $scope.contributions = contributions;
        $scope.collapsed = new Array(contributions.length);
        $scope.contributions.forEach(function (item, index) {

          $scope.contributionLabels[index] = _.find($scope.roles, function (role) {
            return role.id === item.role;
          }).name;
          $scope.collapsed[index] = true;
        });
      });
    }

    function getContent() {
      ContentService.one($scope.contentId).get().then(function (content) {
        $scope.content = content;
        $scope.article = {
          id: content.id
        };
      });
    }

    function remove(index) {
      $scope.contributions.splice(index, 1);
      $scope.collapsed.splice(index, 1);
    }

    function updateLabel(index) {
      $scope.contributionLabels[index] = _.find($scope.roles, function (role) {

        $scope.contributions[index].roleObject = role;
        $scope.contributions[index].paymentType = role.payment_type;
        return role.id === $scope.contributions[index].role;
      }).name;
    }

    getRoles();
    getContent();

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('DatetimeSelectionModalCtrl', function ($scope, $modalInstance, TIMEZONE_NAME, moment) {

    // ensure that we can't choose a time if date is invalid
    $scope.dateValid = false;
    $scope.$watch('tempDatetime', function () {
      $scope.dateValid = moment($scope.tempDatetime).isValid();
    });

    // copy date temporarily so user has to actually verify change to the date
    $scope.tempDatetime = angular.copy($scope.modDatetime);
    if (!$scope.tempDatetime) {
      // default to now if no time given
      $scope.tempDatetime = moment();
    }

    $scope.TIMEZONE_LABEL = moment.tz(TIMEZONE_NAME).format('z');

    var timeNowWithOffset = function () {
      return moment.tz(TIMEZONE_NAME);
    };

    // callback function for using datetime calendar because it doesn't work at all in a sensible way
    $scope.setDate = function (newDate) {
      $scope.tempDatetime = moment(newDate);
    };

    $scope.setDateToday = function () {
      var now = timeNowWithOffset();
      $scope.tempDatetime = moment().year(now.year()).month(now.month()).date(now.date());
    };

    $scope.setDateTomorrow = function () {
      var now = timeNowWithOffset();
      $scope.tempDatetime = moment().year(now.year()).month(now.month()).date(now.date() + 1);
    };

    $scope.setTimeNow = function () {
      $scope.tempDatetime = timeNowWithOffset();
    };

    $scope.setTimeMidnight = function () {
      $scope.tempDatetime = timeNowWithOffset().hour(24).minute(0);
    };

    $scope.chooseDatetime = function () {
      if ($scope.dateValid) {
        // close modal, ensuring that output date is a moment
        var retMoment = moment($scope.tempDatetime);
        $modalInstance.close(retMoment);
      } else {
        console.error('Attempting to choose invalid date.');
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
  .controller('ForbiddenmodalCtrl', function ($scope, detail) {
    $scope.detail = detail;
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ImageCropModalCtrl', function ($scope, $timeout, $modalInstance,
      BettyCropper, CmsConfig, Selection, imageData, ratios, $) {
    $scope.selectedCrop = null;
    $scope.cropMode = false;
    $scope.ratios = ratios;
    $scope.finished = false;
    $scope.thumb_container_styles = {};
    $scope.imageData = imageData;

    if (!$scope.image) {
      $scope.image = null;
      BettyCropper.get(imageData.id).then(function (success) {
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

      angular.element('.crop-image-container img').one('load', function () {
        $(this).Jcrop({
          allowSelect: false,
          allowMove: true,
          allowResize: true,
          keySupport: false
        }, function () {
          $scope.jcrop_api = this;
        });
      });

      $scope.image_url = image.url('original', CmsConfig.getImageDefaultWidth(), 'jpg');
      if (!$scope.ratios) {
        $scope.ratios = Object.keys(image.selections);
      }

      $scope.setThumbStyles();
    });

    $scope.$watch('selectedCrop', function (crop) {
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

      if ($scope.jcrop_api) {
        $scope.jcrop_api.setOptions({
          aspectRatio: selection.width() / selection.height()
        });

        $scope.jcrop_api.setSelect([
          selection.x0,
          selection.y0,
          selection.x1,
          selection.y1
        ]);
      }

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
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $modalInstance, _, moment, ContentFactory, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    ContentFactory.all('log').getList({content: articleOnPage.id}).then(function (log) {
      var latest = _.max(log, function (entry) { return moment(entry.action_time); });
      var lastSavedById = latest.user;
      ContentFactory.one('author', lastSavedById).get().then(function (data) {
        $scope.lastSavedBy = data;
      });
    });

    $scope.loadFromServer = function () {

      // pull article from server and replace whatever data we need to show the newest version
      _.each($scope.articleOnServer, function (value, key) {
        $scope.article[key] = value;
      });
      $scope.articleIsDirty = true;

      $modalInstance.close();

    };

    $scope.saveAnyway = function () {
      $modalInstance.close();
      $scope.$parent.postValidationSaveArticle();
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance,
      $, moment, article, TIMEZONE_NAME, Raven, CmsConfig, PARTIALS_URL) {
    $scope.article = article;

    $scope.pubButton = {
      idle: 'Publish',
      busy: 'Publishing',
      finished: 'Published!',
      error: 'Error!'
    };

    $scope.$watch('pickerValue', function (newVal) {
      var pubTimeMoment = moment(newVal);
      $scope.datePickerValue = moment()
        .year(pubTimeMoment.year())
        .month(pubTimeMoment.month())
        .date(pubTimeMoment.date());
      $scope.timePickerValue = moment()
        .hour(pubTimeMoment.hour())
        .minute(pubTimeMoment.minute());
    });

    var modelDateFormat = 'YYYY-MM-DDTHH:mmZ';

    $scope.setTimeShortcut = function (shortcut) {
      if (shortcut === 'now') {
        var now = moment();
        $scope.pickerValue = now;
      }
      if (shortcut === 'midnight') {
        var midnight = moment().hour(24).minute(0);
        $scope.pickerValue = midnight;
      }
    };

    $scope.setDateShortcut = function (shortcut) {
      var today = moment.tz(TIMEZONE_NAME);
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
          templateUrl: PARTIALS_URL + 'modals/pubtime-validation-modal.html'
        });
        return;
      }

      var newDate = moment($scope.datePickerValue);
      var newTime = moment($scope.timePickerValue);
      var newDateTime = moment.tz(TIMEZONE_NAME)
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date())
        .hour(newTime.hour())
        .minute(newTime.minute())
        .format(modelDateFormat);
      var data = {published: newDateTime};

      return $http({
        url: CmsConfig.buildBackendApiUrl('content/' + $scope.article.id + '/publish/'),
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
        url: CmsConfig.buildBackendApiUrl('content/' + $scope.article.id + '/publish/'),
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
      $scope.pickerValue = moment.tz($scope.article.published, TIMEZONE_NAME);
    } else {
      $scope.setTimeShortcut('now');
    }

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('SponsormodalCtrl', function ($scope, ContentFactory, article, Campaign) {
    $scope.article = article;

    if ($scope.article.campaign) {
      $scope.campaign = Campaign.$find($scope.article.campaign);
    } else {
      $scope.campaign = null;
    }

    $scope.updateArticle = function (selection) {
      $scope.article.campaign = selection.value.id;
    };

    $scope.searchCampaigns = function (searchTerm) {
      return Campaign.simpleSearch(searchTerm);
    };
  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('TargetingCtrl', function ($scope, $http, $window, $q, $location,
      TAR_OPTIONS, CMS_NAMESPACE, CmsConfig) {
    $window.document.title = CMS_NAMESPACE + ' | Targeting Editor';

    var canceller;
    $scope.search = function (url) {
      if (!url) { return; }

      if (typeof(canceller) === 'undefined') {
        canceller = $q.defer();
      } else {
        canceller.resolve();
        canceller = $q.defer();
      }

      $http({
        method: 'GET',
        url: CmsConfig.buildBackendApiUrl(TAR_OPTIONS.endpoint),
        timeout: canceller.promise,
        params: {url: $scope.url}
      }).success(function (data) {
        $scope.targetingArray = [];
        for (var k in data) {
          $scope.targetingArray.push([k, data[k]]);
        }
      }).error(function (data, status, headers, config) {
        if (status === 404) {
          $scope.targetingArray = [];
          $scope.targetingArray.push(['', '']);
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
        url: CmsConfig.buildBackendApiUrl(TAR_OPTIONS.endpoint + '?url=' + $scope.url),
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
  .value('ARTICLE_TEMPORARY_URL_DAYS_VALID', 7)
  .value('ARTICLE_TEMPORARY_URL_BASE', 'http://0.0.0.0:9069/unpublished/')
  .controller('TemporaryUrlModalCtrl', function ($scope, $routeParams, ContentFactory, ARTICLE_TEMPORARY_URL_DAYS_VALID,
                                                 ARTICLE_TEMPORARY_URL_BASE, _, moment) {

    var content = ContentFactory.one('content', $routeParams.id);

    $scope.TEMP_LINK_DAYS_VALID = ARTICLE_TEMPORARY_URL_DAYS_VALID;
    $scope.TEMP_URL_BASE = ARTICLE_TEMPORARY_URL_BASE;

    $scope.tokens = [];
    content.getList('list_tokens').then(function (tokenList) {
      $scope.tokens = tokenList;

      // make dates moments
      var expiredIndicies = [];
      _.each($scope.tokens, function (token, i) {
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);

        if (moment().isAfter(token.expire_date)) {
          // keep track of expired tokens for later removal
          expiredIndicies.push(i);
        } else {
          // this is not expired, keep track of day diff
          token.daysTillExpire = token.expire_date.diff(moment(), 'days') + 1;
        }
      });

      // remove expired tokens from list, done this way so objects remain restangularized
      for (var i = expiredIndicies.length - 1; i >= 0; i--) {
        $scope.tokens.splice(expiredIndicies[i], 1);
      }
    });

    $scope.createToken = function () {

      var now = moment();
      ContentFactory.one('content', $routeParams.id).post('create_token', {
        'create_date': now,
        'expire_date': now.clone().add({days: ARTICLE_TEMPORARY_URL_DAYS_VALID})
      }).then(function (token) {
        // make dates moments
        token.create_date = moment(token.create_date);
        token.expire_date = moment(token.expire_date);
        token.daysTillExpire = token.expire_date.diff(moment(), 'days') + 1;

        $scope.tokens.push(token);
        $scope.newestToken = token;
      });

    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('ThumbnailModalCtrl', function ($scope, BettyCropper, $modalInstance, article) {

    $scope.article = article;

    /**
     * Upload a new image to BettyCropper and set the scope's thumbnailTemp to that new image.
     */
    $scope.selectCustomThumbnail = function () {

      // user is choosing a custom thumbnail
      BettyCropper.upload().then(function (success) {

        $scope.article.thumbnail_override = success;

      }, function (error) {
        console.log(error);
      }, function (progress) {
        console.log(progress);
      });

    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $,
      articleId, Raven, CmsConfig) {
    $scope.deleteButton = {
      idle: 'Delete',
      busy: 'Trashing',
      finished: 'Trashed',
      error: 'Error!'
    };

    $scope.trashContent = function () {
      return $http({
        'method': 'POST',
        'url': CmsConfig.buildBackendApiUrl('content/' + articleId + '/trash/')
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
  .controller('UnpublishCtrl', function ($scope, $http, $q, CmsConfig) {

    $scope.unpubButton = {
      idle: 'Unpublish',
      busy: 'Unpublishing',
      finished: 'Unpublished!',
      error: 'Error'
    };


    $scope.unpublish = function () {
      return $http({
        url: CmsConfig.buildBackendApiUrl('content/' + $scope.article.id + '/publish/'),
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
  .controller('VideothumbnailmodalCtrl', function ($scope, $http, $modalInstance, Zencoder, videoId, VIDEO_THUMBNAIL_URL, CUSTOM_VIDEO_POSTER_URL) {
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
        $scope.video.poster = CUSTOM_VIDEO_POSTER_URL.replace('{{ratio}}', '16x9').replace('{{image}}', $scope.uploadedImage.id);
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
  .factory('BadRequestInterceptor', function ($q, $injector, PARTIALS_URL) {
    return {
      responseError: function (rejection) {
        $injector.invoke(function ($modal) {
          if (rejection.status === 400) {
            var detail = rejection.data || {'something': ['Something was wrong with your request.']};
            $modal.open({
              templateUrl: PARTIALS_URL + 'modals/400-modal.html',
              controller: 'BadrequestmodalCtrl',
              resolve: {
                detail: function () { return detail; }
              }
            });
          }
        });
        return $q.reject(rejection);
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
  .factory('CmsNotificationsApi', function ($q, ContentFactory) {
    return ContentFactory.service('notifications');
  });

'use strict';

angular.module('bulbsCmsApp')
  .service('Gettemplate', function Gettemplate($templateCache, $q, $http) {
    this.get = function (templateUrl) {
      var template = $templateCache.get(templateUrl);
      if (template) {
        return $q.when(template);
      } else {
        var deferred = $q.defer();
        $http.get(templateUrl, {cache: true}).success(function (html) {
          $templateCache.put(templateUrl, html);
          deferred.resolve(html);
        });

        return deferred.promise;
      }
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
  .factory('openImageCropModal', function ($modal, PARTIALS_URL) {
    var openImageCropModal = function (imageData, ratios) {

      return $modal.open({
        templateUrl: PARTIALS_URL + 'image-crop-modal.html',
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
  .factory('TemporaryUrlModalOpener', function ($modal, PARTIALS_URL) {

    var modal = null;

    return {
      open: function ($scope, article) {
        // ensure only one version browser is open at a time
        if (modal) {
          modal.close();
        }

        modal = $modal.open({
          templateUrl: PARTIALS_URL + 'modals/temporary-url-modal.html',
          controller: 'TemporaryUrlModalCtrl',
          scope: $scope,
          resolve: {
            article: function () {
              return article;
            }
          }
        });

        return modal;
      }
    };

  });

'use strict';

angular.module('bulbsCmsApp')
  .service('Zencoder', function Zencoder($http, $q, $modal, $, CmsConfig, PARTIALS_URL) {
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
        url: CmsConfig.buildBackendApiUrl(newVideoUrl),
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
        url: CmsConfig.buildBackendApiUrl('video/' + videoObject.attrs.id + '/encode')
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
        templateUrl: PARTIALS_URL + 'modals/video-thumbnail-modal.html',
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
        url: CmsConfig.buildBackendApiUrl(url)
      });
    };

    this.setVideo = function (video) {
      var url = '/video/' + video.id;
      var data = $.param(video);
      return $http({
        method: 'POST',
        url: CmsConfig.buildBackendApiUrl(url),
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });
    };

    var _encodingVideos = {};
    this.encodingVideos = _encodingVideos;

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

angular.module('bulbsCmsApp')
  .filter('tzDate', function (dateFilter, moment, TIMEZONE_NAME) {
    return function (input, format) {
      if (!input) {
        return '';
      }
      var inDate = moment.tz(input, TIMEZONE_NAME);
      var newdate = inDate.format('YYYY-MM-DDTHH:mm');
      var formattedDate = dateFilter(newdate, format);
      if (format.toLowerCase().indexOf('h') > -1) {
        formattedDate += ' ' + inDate.format('z');
      }
      return formattedDate;
    };
  });
