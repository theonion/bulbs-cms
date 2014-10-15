'use strict';

angular.module('bulbsCmsApp')
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $route, $modalInstance, _, ContentApi, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    ContentApi.all('log').getList({content: article.id}).then(function (log) {
      var latest = _.max(log, function (entry) { return moment(entry.action_time); });
      var lastSavedById = latest.user;
      ContentApi.one('author', lastSavedById).get().then(function (data) {
        $scope.lastSavedBy = data;
      });
    });

    $scope.loadFromServer = function () {

      // pull article from server and replace whatever data we need to show the newest version
      _.each($scope.articleOnServer, function (value, key) {
        $scope.article[key] = value;
      });
      $scope.articleIsDirty = true;

      $modalInstance.close();

    };

    $scope.saveAnyway = function () {
      $modalInstance.close();
      $scope.$parent.postValidationSaveArticle();
    };

  });
