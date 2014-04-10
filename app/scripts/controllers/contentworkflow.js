'use strict';

angular.module('bulbsCmsApp')
  .controller('ContentworkflowCtrl', function ($scope, $http, $modal, routes) {
    $scope.trashContentModal = function (articleId) {
      $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/confirm-trash-modal.html',
        controller: 'TrashcontentmodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function(){ return articleId; }
        }
      });
    };

    $scope.pubTimeModal = function(articleId) {
      $modal.open({
        templateUrl: routes.PARTIALS_URL + 'modals/choose-date-modal.html',
        controller: 'PubtimemodalCtrl',
        scope: $scope,
        resolve: {
          articleId: function(){ return articleId; }
        }
      });
    };

  });
