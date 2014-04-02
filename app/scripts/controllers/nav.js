'use strict';

angular.module('bulbsCmsApp')
  .controller('NavCtrl', function ($scope, $location, $window) {

    //this is a controller for the navbar
    $scope.STATIC_URL = $window.STATIC_URL;

    $scope.isEditPage = $location.path().indexOf('/cms/app/edit/') === 0 ? true : false;
    console.log('is Edit Page: ' + $scope.isEditPage);


    if (!$scope.isEditPage) {
      //keeping those <ul>s hidden until angular is loaded so it doesnt jump after load.
      //edit page nav loader will call this
      $('ul.nav').show();
    }

    $scope.isActive = function (viewLocation) {
      return $location.path().indexOf(viewLocation) === 0;
    };

  });
