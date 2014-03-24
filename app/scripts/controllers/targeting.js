'use strict';

angular.module('bulbsCmsApp')
  .controller('TargetingCtrl', function ($scope, $http, $window, $location) {
    //set title
    $window.document.title = "AVCMS | Targeting Editor";

    NProgress.configure({
      minimum: 0.4
    })

    $scope.$watch('url', function(){
      if(!$scope.url) return;

      $scope.targetingArray = [];
      NProgress.start();
      $http({
        method: 'GET',
        url: '/ads/targeting',
        params: {url: $scope.url}
      }).success(function(data){
        for(var k in data){
          $scope.targetingArray.push([k, data[k]]);
        }
        NProgress.done();
      }).error(function(data, status, headers, config){
        if(status == 404){
          //this isnt actually working yet
          $scope.targetingArray.push(["", ""]);
        }
        NProgress.done();
      });
    });

    $scope.save = function(){
      var data = {};
      for(var i in $scope.targetingArray){
        data[$scope.targetingArray[i][0]] = $scope.targetingArray[i][1];
      }
      NProgress.start();
      $http({
        method: 'POST',
        url: '/ads/targeting?url=' + $scope.url,
        data: data
      }).success(function(data){
        NProgress.done();
      }).error(function(){
        NProgress.done();
      })

    }

    //grab url query key
    var search = $location.search();
    if(search && search.url){
      $scope.url = decodeURIComponent(search.url);
    }

  });
