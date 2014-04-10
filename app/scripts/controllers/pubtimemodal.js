'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, routes, article) {
    $scope.asswipe = 2;
    $scope.setPubTime = function () {
      console.log('setPubTime here')
      console.log(article)
      console.log($modalInstance)
      if (!article.feature_type) {
        $modalInstance.dismiss();
        $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/pubtime-validation-modal.html'
        });
        return;
      }

          var newPubDate = $('#chooseDate .date input').val();
          if (newPubDate) {
            //the CST locks this to CST.
            newPubDate = moment(newPubDate, 'MM/DD/YYYY hh:mm a CST').format('YYYY-MM-DDTHH:mmZ');
          }
          var data = {published: newPubDate};

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
