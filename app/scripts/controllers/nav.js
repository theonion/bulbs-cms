'use strict';

angular.module('bulbsCmsApp')
  .controller('NavCtrl', function ($scope, $http, openBugReportModal, routes) {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.NAV_LOGO = routes.NAV_LOGO;

    $http.get('/users/me').then(function(data){
      $scope.current_user = data.data;
    })
  });
