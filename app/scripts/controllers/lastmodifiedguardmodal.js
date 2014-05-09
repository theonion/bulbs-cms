'use strict';

angular.module('bulbsCmsApp')
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $route, $modalInstance, ContentApi, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    ContentApi.all('log').getList({content: article.id}).then(function (log) {
      var latest = _.max(log, function(entry){ return moment(entry.action_time) })
      var lastSavedById = latest.user;
      ContentApi.one('author', lastSavedById).get().then(function (data) {
        $scope.lastSavedBy = data;
      });
    });

    $scope.loadFromServer = function () {
      $route.reload();
      $modalInstance.close();
    }

    $scope.saveAnyway = function () {
      $modalInstance.close();
      $scope.$parent.postValidationSaveArticle();
    }

  });
