'use strict';

angular.module('bulbsCmsApp')
  .controller('UnpublishCtrl', function ($scope, $http, $q) {

    $scope.unpublish = function (article) {
      var data = {published: false};
      console.log(" hi")
      var deferred = $q.defer();
      $http({
        url: '/cms/api/v1/content/' + article.id + '/publish/',
        method: 'POST',
        data: data
      }).success(function(data){
        deferred.resolve({article: article, response: data});
      }).error(function(data){
        deferred.reject(data);
      });

      return deferred.promise;
    }
  });
