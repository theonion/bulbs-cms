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
    }


  });
