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

  /* helpful SO question on injecting $modal into interceptor-
    http://stackoverflow.com/questions/14681654/i-need-two-instances-of-angularjs-http-service-or-what
  */
  $httpProvider.interceptors.push(function ($q, $injector, routes) {
    return {
      responseError: function (rejection) {
        $injector.invoke(function($modal){
          if (rejection.status == 403) {
            if(rejection.detail && rejection.detail.indexOf("credentials") > 0){
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/login-modal.html',
                controller: 'LoginmodalCtrl'
              });
            }else{
              var detail = rejection.data && rejection.data.detail || 'Forbidden';
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/403-modal.html',
                controller: 'ForbiddenmodalCtrl',
                resolve: {
                  detail: function(){ return detail; }
                }
              });
            }
          }
          return $q.reject(rejection);
        });
      }
    }
  });

})
.run(function ($rootScope, $http, $cookies) {
  // set the CSRF token here
  $http.defaults.headers.common['X-CSRFToken'] = $cookies.csrftoken;
  var deleteHeaders = $http.defaults.headers.delete || {};
  deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
  $http.defaults.headers.delete = deleteHeaders;
});

