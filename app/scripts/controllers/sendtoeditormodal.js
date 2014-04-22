'use strict';

angular.module('bulbsCmsApp')
  .controller('SendtoeditormodalCtrl', function ($scope, $http, $modalInstance, Login, article) {
    $scope.sendToEditor = function (article) {
      $http({
        url: '/cms/api/v1/content/' + article.id + '/send/',
        method: 'POST',
        data: {notes: $scope.noteToEditor}
      }).success(function (data) {
        $scope.publishSuccessCbk(article, data);
      }).error(function (error, status, data) {
        if(status === 403) {
          Login.showLoginModal();
        }
        $modalInstance.dismiss();
      });
    };
  });
