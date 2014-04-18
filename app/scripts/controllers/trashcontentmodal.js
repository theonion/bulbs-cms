'use strict';

angular.module('bulbsCmsApp')
  .controller('TrashcontentmodalCtrl', function ($scope, $http, $modalInstance, $, Login, articleId) {
    console.log('trash content modal ctrl here')
    console.log(articleId)

    $modalInstance.result.then(
      function(){ $('#trash-confirm-button').html('Delete'); },
      function(){ $('#trash-confirm-button').html('Delete'); }
    );

    $scope.trashContent = function () {
      console.log("trash content here");
      $('#trash-confirm-button').html('<i class="fa fa-refresh fa-spin"></i> Trashing');
      return $http({
        'method': 'POST',
        'url': '/cms/api/v1/content/' + articleId + '/trash/'
      }).success(function (data) {
        console.log("trash success")
        $scope.trashSuccessCbk();
        $modalInstance.close();
      }).error(function (data, status, headers, config) {
        if (status === 404) {
          $scope.trashSuccessCbk();
          $modalInstance.close();
        } else if (status === 403) {
          Login.showLoginModal();
          $modalInstance.dismiss();
        } else {
          $('#trash-confirm-button').html('<i class="fa fa-frown-o" style="color:red"></i> Error!');
        }
      });

    };
  });
