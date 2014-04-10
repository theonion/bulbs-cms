'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modalInstance, $, articleId) {
    $scope.setPubTime = function () {
      $('#save-pub-time-button').html('<i class="fa fa-refresh fa-spin"></i> Saving');
      $http({
        url: '/cms/api/v1/content/' + article.id + '/publish/',
        method: 'POST',
        data: data
      }).success(function (resp) {
        scope.publishSuccessCbk(article, resp);
        $modalInstance.close();
        $('#save-pub-time-button').html('Save Changes');
      }).error(function (error, status, data) {
        if (status === 403) {
          scope.showLoginModal();
          $('#save-pub-time-button').html('Save Changes');
        }
      });

    }
  });
