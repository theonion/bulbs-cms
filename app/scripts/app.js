'use strict';

// ****** External Libraries ****** \\

angular.module('underscore', []).value('_', window._);
angular.module('NProgress', []).value('NProgress', window.NProgress);
angular.module('URLify', []).value('URLify', window.URLify);
angular.module('jquery', []).value('$', window.$);
angular.module('moment', []).value('moment', window.moment);
angular.module('PNotify', []).value('PNotify', window.PNotify);
angular.module('keypress', []).value('keypress', window.keypress);

// ****** App Config ****** \\

var appDependencies = [
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
  'keypress'
];
// Potentially add app-specific dependencies
if (window.additionalBulbsCMSDependencies) {
  appDependencies = appDependencies.concat(window.additionalBulbsCMSDependencies);
}

angular.module('bulbsCmsApp', appDependencies)
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
  $provide.decorator('$exceptionHandler', function($delegate) {
    return function(exception, cause) {
      $delegate(exception, cause);
      window.Raven.captureException(exception);
    }
  });

  $httpProvider.interceptors.push(function ($q, $window, PNotify) {
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
              'Looks like something just went wrong, and we need your help to fix it! \
              Report it, and we\'ll make sure it never happens again.',
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
            addclass: "stack-bottomright",
            stack: stack
          });
        }
        return $q.reject(rejection);
      }
    };
  });
})
.run(function ($rootScope, $http, $cookies) {
  // set the CSRF token here
  $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
  var deleteHeaders = $http.defaults.headers.delete || {};
  deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
  $http.defaults.headers.delete = deleteHeaders;
});

