'use strict';

angular.module('bulbsCmsApp')
  .controller('SendtoeditormodalCtrl', function ($scope, $http, $modalInstance, EditorItems, Login, article) {
    $scope.buttonConfig = {
      idle: 'Send',
      busy: 'Sending',
      finished: 'Sent!',
      error: 'Error!'
    }

    $scope.sendToEditor = function (article) {
      return $http({
        url: '/cms/api/v1/content/' + article.id + '/send/',
        method: 'POST',
        data: {notes: $scope.noteToEditor}
      }).success(function (data) {
        console.log('here')
        EditorItems.getItems(article.id);
        $scope.publishSuccessCbk({article: article, response: data});
        $modalInstance.close();
      }).error(function (error, status, data) {
        if(status === 403) {
          Login.showLoginModal();
        }
        $modalInstance.dismiss();
      });
    };
  });
