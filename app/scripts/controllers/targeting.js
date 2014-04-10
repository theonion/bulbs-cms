'use strict';

angular.module('bulbsCmsApp.targeting')
  .controller('TargetingCtrl', function ($scope, $http, $window, $q, $location, options, NProgress) {
    //set title
    $window.document.title = options.namespace + ' | Targeting Editor';

    NProgress.configure({
      minimum: 0.4
    });

    var canceller;
    $scope.search = function (url) {
      if(!url) { return; }

      if (typeof(canceller) === 'undefined') {
        canceller = $q.defer();
      } else {
        canceller.resolve();
        NProgress.set(0);
        canceller = $q.defer();
      }

      NProgress.start();

      $http({
        method: 'GET',
        url: options.endpoint,
        timeout: canceller.promise,
        params: {url: $scope.url}
      }).success(function (data) {
        $scope.targetingArray = [];
        for (var k in data) {
          $scope.targetingArray.push([k, data[k]]);
        }
        NProgress.done();
      }).error(function (data, status, headers, config) {
        if (status == 404) {
          $scope.targetingArray = [];
          $scope.targetingArray.push(["", ""]);
          NProgress.done();
        }
      });
    }

    $scope.save = function () {
      var data = {};
      for (var i in $scope.targetingArray) {
        data[$scope.targetingArray[i][0]] = $scope.targetingArray[i][1];
      }
      NProgress.start();
      $http({
        method: 'POST',
        url: options.endpoint + '?url=' + $scope.url,
        data: data
      }).success(function (data) {
        NProgress.done();
      }).error(function () {
        NProgress.done();
      });

    };

    $scope.keyHandler = function (event, url) {
      if (event.keyCode === 13) { // enter
        this.search(url);
      } else if (event.keyCode === 27) { // escape
        event.currentTarget.value = "";
      }
    }

    //grab url query key
    var search = $location.search();
    if (search && search.url) {
      $scope.url = decodeURIComponent(search.url);
    }
  }
);
