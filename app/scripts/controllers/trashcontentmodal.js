'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $, articleId) {
    console.log('trash content modal ctrl here')
    console.log(articleId)

    $scope.trashContent = function () {
      console.log("trash content here");
      $('#trash-confirm-button').html('<i class="fa fa-refresh fa-spin"></i> Trashing');
      $http({
        'method': 'POST',
        'url': '/cms/api/v1/content/' + articleId + '/trash/'
      }).success(function (data) {
        console.log("trash success")
        $scope.trashSuccessCbk();
        $('#trash-confirm-button').html('Delete');
        $modalInstance.close();
      }).error(function (data, status, headers, config) {
        if (status === 404) {
          $scope.trashSuccessCbk();
        } else if (status === 403) {
          $scope.showLoginModal();
        } else {
          $('#trash-confirm-button').html('<i class="fa fa-frown-o" style="color:red"></i> Error!');
        }
      });

    };
  });
