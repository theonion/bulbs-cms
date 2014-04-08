'use strict';

angular.module('bulbsCmsApp')
  .service('Contenteditservice', function Contenteditservice($http, $q, $route) {
    var service = this;

    return {
      get: function(){
        var deferred = $q.defer();
        if(!$route.current || !$route.current.params || !$route.current.params.id) return {};
        var url = '/cms/api/v1/content/' + $route.current.params.id + '/';
        $http({
            method: 'GET',
            url: url
          }).success(function (data) {
            console.log("content edit service http success here");
            service.content = data;
            deferred.resolve(data);
          }).error(function (data, status) {
            console.log("content edit service http error here");
            deferred.reject(data);
          });

        return deferred.promise;
      }
    }
  });
