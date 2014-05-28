'use strict';

angular.module('bulbsCmsApp')
  .controller('NavCtrl', function ($scope, ContentApi, routes) {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.NAV_LOGO = routes.NAV_LOGO;

    ContentApi.one('me').get().then(function(data){
      $scope.current_user = data;
    })
  });
