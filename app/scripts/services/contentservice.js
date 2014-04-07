'use strict';

angular.module('bulbsCmsApp')
  .service('Contentservice', function Contentservice($http, $q) {
    console.log("Contentservice here");

    this.url = '/cms/api/v1/content';

    this.get = function(){
      var deferred = $q.defer();

      $http({
          method: 'GET',
          url: this.url
        }).success(function (data) {
          console.log("content service http success here");
          deferred.resolve(data);
        }).error(function (data, status) {
          deferred.reject(data);
        });

      return deferred.promise;
    }

    return this.get();
  });
