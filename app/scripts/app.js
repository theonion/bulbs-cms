'use strict';

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});

var jquery = angular.module('jquery', []);
jquery.factory('$', function() {
  return window.$; // assumes jquery has already been loaded on the page
});

angular.module('bulbsCmsApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'jquery',
  'underscore'
])
  .config(function ($locationProvider, $routeProvider, $sceProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider
      .when('/cms/app/list/:queue/', {
        templateUrl: PARTIALS_URL + 'contentlist.html',
        controller: 'ContentlistCtrl',
        reloadOnSearch: false
      })
      .when('/cms/app/edit/:id/', {
        templateUrl: PARTIALS_URL + 'contentedit.html',
        controller: 'ContenteditCtrl'
      })
      .when('/cms/app/promotion/', {
        templateUrl:  PARTIALS_URL + 'promotion.html',
        controller: 'PromotionCtrl',
        reloadOnSearch: false
      })
      .when('/cms/app/targeting/', {
        templateUrl: PARTIALS_URL + 'targeting-editor.html',
        controller: 'TargetingCtrl'
      })
      .when('/cms/app/pzones/', {
        templateUrl: PARTIALS_URL + 'pzones.html',
        controller: 'PZoneCtrl'
      })
      .otherwise({
        redirectTo: '/cms/app/list/published/'
      });

    //TODO: whitelist staticonion.
    $sceProvider.enabled(false);
    /*.resourceUrlWhitelist([
    'self',
    STATIC_URL + "**"]);*/

  })
  .config(function($provide) {
    $provide.decorator('$exceptionHandler', function($delegate) {
      return function(exception, cause) {
        $delegate(exception, cause);
        window.Raven.captureException(exception);
      }
    });
  })
  .run(function($rootScope, $http, $cookies){
    // set the CSRF token here
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
  });