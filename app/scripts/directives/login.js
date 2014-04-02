'use strict';

angular.module('bulbsCmsApp')
  .directive('login', function ($http, $cookies, $window, $) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'login.html',
      link: function (scope, element, attrs) {
        scope.showLoginModal = function () {
          $('#login-modal').modal('show');
        };
        $window.showLoginModal = scope.showLoginModal;
        scope.login = function () {
          var username = $('input[name="username"]').val();
          var password = $('input[name="password"]').val();
          var data = $.param({username: username, password: password});
          $http({
            method: 'POST',
            url: '/login/',
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).success(function (data) {
            $('#login-modal').modal('hide');
          }).error(function (data, status, headers, config) {
            console.log('error');
            console.log(data);
          });
        };

        scope.$watch(function () {
          return $cookies.csrftoken;
        }, function (newCsrf, oldCsrf) {
          $http.defaults.headers.post['X-CSRFToken'] = newCsrf;
          $window.jqueryCsrfSetup();
        });
      }
    };
  });
