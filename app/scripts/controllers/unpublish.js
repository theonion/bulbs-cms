'use strict';

angular.module('bulbsCmsApp')
  .controller('UnpublishCtrl', function ($scope, $http, $q) {

    $scope.unpubButton = {
      idle: 'Unpublish',
      busy: 'Unpublishing',
      finished: 'Unpublished!',
      error: 'Error'
    };


    $scope.unpublish = function () {
      var data = {published: false};
      var deferred = $q.defer();
      $http({
        url: '/cms/api/v1/content/' + $scope.article.id + '/publish/',
        method: 'POST',
        data: data
      }).success(function(data){
        deferred.resolve({article: $scope.article, response: data});
      }).error(function(data){
        deferred.reject(data);
      });

      return deferred.promise;
    }
  });
