'use strict';

angular.module('bulbsCmsApp')
  .controller('ChangelogmodalCtrl', function ($scope, $modalInstance, _, ContentFactory, article) {
    $scope.article = article;
    $scope.users = {};

    ContentFactory.all('log').getList({content: article.id}).then(function (data) {
      $scope.changelog = data;

      var userIds = _.unique(_.pluck(data, 'user'));
      var resp = function (data) {
        $scope.users[data.id] = data;
      };

      for (var i in userIds) {
        ContentFactory.one('author', userIds[i]).get().then(resp);
      }
    });

  });
