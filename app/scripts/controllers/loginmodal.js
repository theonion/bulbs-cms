'use strict';

angular.module('bulbsCmsApp')
  .controller('LoginmodalCtrl', function ($scope, Login, $modalInstance) {
    $scope.login = function(){
      Login.login($scope.username, $scope.password).then(
        function(){ $modalInstance.close(); },
        function(){ $modalInstance.dismiss(); }
      )
    }

  });
