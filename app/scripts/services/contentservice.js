'use strict';

angular.module('bulbsCmsApp')
  .service('Contentservice', function Contentservice($http, $q, $route) {
    this.url = '/cms/api/v1/content';
    if($route.current && $route.current.params.id){
      this.url = '/cms/api/v1/content/' + $route.current.params.id + '/';
    }

    this.get = function(){
      var deferred = $q.defer();

      $http({
          method: 'GET',
          url: this.url
        }).success(function (data) {
          console.log("content service http success here");
          deferred.resolve(data);
        }).error(function (data, status) {
          console.log("content service http error here");
          deferred.reject(data);
        });

      return deferred.promise;
    }

    return this.get();
  });
