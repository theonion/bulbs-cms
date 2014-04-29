'use strict';

angular.module('bulbsCmsApp')
  .controller('NavCtrl', function ($scope, routes) {
    $scope.PARTIALS_URL = routes.PARTIALS_URL;
    $scope.NAV_LOGO = routes.NAV_LOGO;
  });
