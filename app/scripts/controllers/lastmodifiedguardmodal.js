'use strict';

angular.module('bulbsCmsApp')
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $modalInstance, _, moment, ContentFactory, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    ContentFactory.all('log').getList({content: articleOnPage.id}).then(function (log) {
      var latest = _.max(log, function (entry) { return moment(entry.action_time); });
      var lastSavedById = latest.user;
      ContentFactory.one('author', lastSavedById).get().then(function (data) {
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
