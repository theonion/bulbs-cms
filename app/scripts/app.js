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
