'use strict';

angular.module('bulbsCmsApp')
  .service('Contentlistservice', function Contentlistservice($http, $q) {
    return {
      get: function(){
        var deferred = $q.defer();

        $http({
            method: 'GET',
            url: '/cms/api/v1/content'
          }).success(function (data) {
            console.log("content list service http success here");
            deferred.resolve(data);
          }).error(function (data, status) {
            console.log("content list service http error here");
            deferred.reject(data);
          });

        return deferred.promise;
      }
    }
  });
