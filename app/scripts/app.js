'use strict';

// ****** External Libraries ****** \\

angular.module('underscore', []).value('_', window._);
angular.module('NProgress', []).value('NProgress', window.NProgress);
angular.module('URLify', []).value('URLify', window.URLify);
angular.module('jquery', []).value('$', window.$);
angular.module('moment', []).value('moment', window.moment);


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
  'moment'
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
.config(function ($provide) {
  $provide.decorator('$exceptionHandler', function($delegate) {
    return function(exception, cause) {
      $delegate(exception, cause);
      window.Raven.captureException(exception);
    }
  });
})
.run(function ($rootScope, $http, $cookies) {
  // set the CSRF token here
  $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
  var deleteHeaders = $http.defaults.headers.delete || {};
  deleteHeaders['X-CSRFToken'] = $cookies.csrftoken;
  $http.defaults.headers.delete = deleteHeaders;
});

