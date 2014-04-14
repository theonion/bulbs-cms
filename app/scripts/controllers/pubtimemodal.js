'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, routes, article) {
    $scope.article = article;

    $scope.setPubTime = function (article) {
      //we're planning on making feature_type a db required field
      //but for now we're just validating on the front-end on publish
      if (!article.feature_type) {
        $modalInstance.dismiss();
        $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/pubtime-validation-modal.html'
        });
        return;
      }

      var newPubDate = $scope.dateTimePickerValue;
      console.log(newPubDate);
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
        $scope.publishSuccessCbk && $scope.publishSuccessCbk(article, resp);
        $modalInstance.close();
        $('#save-pub-time-button').html('Save Changes');
      }).error(function (error, status, data) {
        if (status === 403) {
          $scope.showLoginModal();
          $('#save-pub-time-button').html('Save Changes');
        }
      });
    };

  });
