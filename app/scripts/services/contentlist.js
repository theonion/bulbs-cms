'use strict';

angular.module('bulbsCmsApp')
  .service('Contentlist', function Contentlist($http, $location, $timeout, $window) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.url = '/cms/api/v1/content';
    this.setUrl = function (url) { this.url = url; };

    /*
      getContent is really stupid right now because I dont have
    time to figure out promises or whatever I would need to pass in a
    callback that would use the scope of the consumer controller.
      Ideally its just function (callback) { ... }
      Or maybe even more ideally it just listens to $routeUpdate and updates
    whenever a controller uses $location.search(). That would be pretty cool.
      BUT- Ideally content list can be decoupled from $location.search() so it
    can be used
    */
    this.getContent = function ($scope, callback) {
      //clean params in case we got some bad shit in there
      var params = {};
      for (var p in $location.search()) {
        var value = $location.search()[p];
        if (value !== 'false' && value !== 'undefined' && value !== '') {
          params[p] = value;
        }
      }
      $location.search(params);

      params = {};
      for (var k in $location.search()) {
        params[k] = $location.search()[k];
      }

      $scope.params = params;
      $scope.currentPage = params.page || 1;
      $scope.articles = [{'id': -1, 'title': 'Loading'}];

      $window.NProgress.configure({
        minimum: 0.4
      });
      $window.NProgress.start();
      $http({
        method: 'GET',
        url: this.url,
        params: params
      }).success(function (data) {
        $window.NProgress.done();
        callback($scope, data);
      }).error(function (data, status) {
        if (status === 403) {
          var path = $location.path();
          $window.location.href = $window.location.origin + '/login?next=' + path;
        }
      });
    };
  });

