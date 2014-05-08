'use strict';

angular.module('bulbsCmsApp')
  .controller('LastmodifiedguardmodalCtrl', function ($scope, $route, $modalInstance, articleOnPage, articleOnServer) {
    $scope.articleOnServer = articleOnServer;

    $scope.loadFromServer = function () {
      $route.reload();
      $modalInstance.close();
    }

    $scope.saveAnyway = function () {
      $modalInstance.close();
      $scope.$parent.postValidationSaveArticle();
    }

  });
