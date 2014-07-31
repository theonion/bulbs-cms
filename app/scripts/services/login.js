'use strict';

angular.module('bulbsCmsApp')
  .service('Login', function Login($rootScope, $http, $cookies, $window, $, routes) {

    $rootScope.$watch(function () {
      return $cookies.csrftoken;
    }, function (newCsrf, oldCsrf) {
      $http.defaults.headers.common['X-CSRFToken'] = newCsrf;
      if ($window.jqueryCsrfSetup) {
        $window.jqueryCsrfSetup();
      }
    });

    return {
      login: function (username, password) {
        var data = $.param({username: username, password: password});
        return $http({
          method: 'POST',
          url: '/login/',
          data: data,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
      }
    };
  });