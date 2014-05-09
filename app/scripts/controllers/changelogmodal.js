'use strict';

angular.module('bulbsCmsApp')
  .controller('ChangelogmodalCtrl', function ($scope, $http, $modalInstance, _, ContentApi, article) {
    $scope.article = article;
    $scope.users = {};

    ContentApi.all('log').getList({content: article.id}).then(function (data) {
      $scope.changelog = data;

      var userIds = _.unique(_.pluck(data, 'user'));
      for(var i in userIds){
        ContentApi.one('author', userIds[i]).get().then(function (data) {
          $scope.users[data.id] = data;
        });
      }
    });

  });
