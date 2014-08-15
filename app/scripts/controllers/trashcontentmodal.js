'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $, Login, articleId, Raven) {
    $scope.deleteButton = {
      idle: 'Delete',
      busy: 'Trashing',
      finished: 'Trashed',
      error: 'Error!'
    };

    $scope.trashContent = function () {
      return $http({
        'method': 'POST',
        'url': '/cms/api/v1/content/' + articleId + '/trash/'
      });
    };

    $scope.trashCbk = function (trash_promise) {
      trash_promise
        .then(function (result) {
          console.log('trash success');
          $scope.trashSuccessCbk();
          $modalInstance.close();
        })
        .catch(function (reason) {
          if (reason.status === 404) {
            $scope.trashSuccessCbk();
            $modalInstance.close();
            return;
          }
          Raven.captureMessage('Error Deleting Article', {extra: reason});
          $modalInstance.dismiss();
        });
    };
  });
