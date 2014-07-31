'use strict';

angular.module('bulbsCmsApp')
  .controller('LoginmodalCtrl', function ($scope, Login, $modalInstance, $) {
    $scope.login = function () {
      var username = $('input[name=\'username\']').val();
      var password = $('input[name=\'password\']').val();
      Login.login(username, password).then(
        function () { $modalInstance.close(); },
        function () { $modalInstance.dismiss(); }
      );
    };
  });
