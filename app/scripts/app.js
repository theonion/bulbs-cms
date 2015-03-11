'use strict';

// ****** External Libraries ****** \\

angular.module('lodash', []).constant('_', window._);
angular.module('NProgress', []).constant('NProgress', window.NProgress);
angular.module('URLify', []).constant('URLify', window.URLify);
angular.module('jquery', []).constant('$', window.$);
angular.module('moment', []).constant('moment', window.moment);
angular.module('PNotify', []).constant('PNotify', window.PNotify);
angular.module('keypress', []).constant('keypress', window.keypress);
angular.module('Raven', []).constant('Raven', window.Raven);
angular.module('OnionEditor', []).constant('OnionEditor', window.OnionEditor);

// ****** App Config ****** \\

angular.module('bulbsCmsApp', [
  'bulbsCmsApp.settings',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'restangular',
  'BettyCropper',
  'jquery',
  'lodash',
  'NProgress',
  'URLify',
  'moment',
  'PNotify',
  'keypress',
  'Raven',
  'firebase',
  'ipCookie',
  'bulbs.api',
  'OnionEditor',
  // shared
  'contentServices',
  // components
  'filterWidget',
  'promotedContent',
  'statusFilter',
  'templateTypeField'
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
    .when('/cms/app/edit/:id/contributions/', {
      templateUrl: routes.PARTIALS_URL + 'contributions.html',
      controller: 'ContributionsCtrl'
    })
    .when('/cms/app/targeting/', {
      templateUrl: routes.PARTIALS_URL + 'targeting-editor.html',
      controller: 'TargetingCtrl'
    })
    .when('/cms/app/notifications/', {
      templateUrl: routes.PARTIALS_URL + 'cms-notifications.html',
      controller: 'CmsNotificationsCtrl'
    })
    .when('/cms/app/reporting/', {
      templateUrl: routes.PARTIALS_URL + 'reporting.html',
      controller: 'ReportingCtrl'
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
})
.constant('TIMEZONE_NAME', 'America/Chicago');
