'use strict';

// ****** External Libraries ****** \\

angular.module('underscore', []).value('_', window._);
angular.module('NProgress', []).value('NProgress', window.NProgress);
angular.module('URLify', []).value('URLify', window.URLify);
angular.module('jquery', []).value('$', window.$);


// ****** App Config ****** \\

angular.module('bulbsCmsApp', [
  'bulbsCmsApp.targeting',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'jquery',
  'underscore',
  'NProgress',
  'URLify'
])
.config(function ($locationProvider, $routeProvider, $sceProvider, routes) {
  $locationProvider.html5Mode(true);

  $routeProvider
    .when('/cms/app/list/:queue/', {
      templateUrl: routes.PARTIALS_URL + 'contentlist.html',
      controller: 'ContentlistCtrl',
      reloadOnSearch: false
    })
    .when('/cms/app/edit/:id/', {
      templateUrl: routes.PARTIALS_URL + 'contentedit.html',
      controller: 'ContenteditCtrl'
    })
    .when('/cms/app/promotion/', {
      templateUrl: routes.PARTIALS_URL + 'promotion.html',
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
      redirectTo: '/cms/app/list/published/'
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
});

// ****** CMS Plugins ****** \\

angular.module('bulbsCmsApp.targeting', [])

.value('options', {
  namespace: 'AVCMS',
  endpoint: '/ads/targeting'
});
