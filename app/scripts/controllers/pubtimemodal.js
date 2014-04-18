'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, moment, Login, routes, article) {
    $scope.article = article;

    var oldPubTime = $scope.article.published;

    $modalInstance.result.then(
      function(){ }, //closed
      function(){ //dismissed
        $scope.article.published = oldPubTime;
        $('#save-pub-time-button').html('Save Changes');
      }
    );

    var viewDateFormat = 'MM/DD/YYYY hh:mm a';
    var modelDateFormat = 'YYYY-MM-DDTHH:mmZ';

    $scope.setPublishNow = function () {
      $scope.article.published = moment().format(modelDateFormat);
    }

    $scope.setPublishMidnight = function () {
      $scope.article.published = moment(new Date().setHours(24,0,0,0)).format(modelDateFormat);
    }

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

      var data = {published: $scope.article.published};

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
          Login.showLoginModal();
        }
        $modalInstance.dismiss();
      });
    };

  });
