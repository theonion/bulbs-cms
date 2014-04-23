'use strict';

angular.module('bulbsCmsApp')
  .service('Login', function Login($rootScope, $http, $cookies, $window, $modal, $, routes) {

    $rootScope.$watch(function () {
      return $cookies.csrftoken;
    }, function (newCsrf, oldCsrf) {
      $http.defaults.headers.post['X-CSRFToken'] = newCsrf;
      $window.jqueryCsrfSetup && $window.jqueryCsrfSetup();
    });

    return {
      showLoginModal: function () {
        return $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/login-modal.html',
          controller: 'LoginmodalCtrl'
        });
      },
      login: function (username, password) {
        var data = $.param({username: username, password: password});
        return $http({
            method: 'POST',
            url: '/login/',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          })
      }
    }
  });