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

// NOTE : this is an intermediate and should be removed
angular.module('bulbsCmsApp.settings', [
  'bulbs.cms.site.config'
]);

angular.module('bulbsCmsApp', [
  'bulbs.cms.site.config',

  'ngCookies',
  'ngResource',
  'ngRoute',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'restangular',
  'BettyCropper',
  'jquery',
  'lodash',
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
  'cms.tunic',
  // components
  'bettyEditable',
  'bugReporter',
  'campaigns',
  'evergreenField',
  'filterWidget',
  'filterListWidget',
  'polls',
  'promotedContent',
  'statusFilter',
  'templateTypeField',
  'specialCoverage',
  'sections',
  'reports'
])
.config(function ($locationProvider, $routeProvider, $sceProvider) {
  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/cms/app/list/', {
      templateUrl: '/views/contentlist.html',
      controller: 'ContentlistCtrl',
      reloadOnSearch: false
    })
    .when('/cms/app/edit/:id/', {
      templateUrl: '/views/contentedit.html',
      controller: 'ContenteditCtrl',
      reloadOnSearch: false
    })
    .when('/cms/app/edit/:id/contributions/', {
      templateUrl: '/views/contributions.html',
      controller: 'ContributionsCtrl'
    })
    .when('/cms/app/targeting/', {
      templateUrl: '/views/targeting-editor.html',
      controller: 'TargetingCtrl'
    })
    .when('/cms/app/notifications/', {
      templateUrl: '/views/cms-notifications.html',
      controller: 'CmsNotificationsCtrl'
    })
    .when('/cms/app/reporting/', {
      templateUrl: '/views/reporting.html',
      controller: 'ReportingCtrl'
    })
    .when('/cms/app/pzones/', {
      templateUrl: '/views/pzones.html',
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
  $httpProvider.interceptors.push('TunicInterceptor');
})
.run(function ($rootScope, $http, $cookies) {
  // set the CSRF token here
  $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
  var deleteHeaders = $http.defaults.headers.delete || {};
  deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
  $http.defaults.headers.delete = deleteHeaders;
})
.constant('TIMEZONE_NAME', 'America/Chicago');
