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
        templateUrl: '/views/contentlist.html',
        controller: 'ContentlistCtrl'
      })
      .when('/cms/app/edit/:id/', {
        templateUrl: '/views/contentedit.html',
        controller: 'ContenteditCtrl'
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
  .run(function($rootScope, $http, $cookies){
    // set the CSRF token here
    $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
  });