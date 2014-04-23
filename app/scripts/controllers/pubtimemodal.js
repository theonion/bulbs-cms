'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, moment, Login, routes, article, TIMEZONE_OFFSET) {
    $scope.article = article;
    $scope.dateTimePickerValue = $scope.article.published;
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
      $scope.article.published = moment().zone(TIMEZONE_OFFSET).format(modelDateFormat);
    }

    $scope.setPublishMidnight = function () {
      $scope.article.published = moment().zone(TIMEZONE_OFFSET).hour(24).minute(0).format(modelDateFormat);
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

    $scope.dateTimePickerCallback = function(newVal, oldVal) {
      var newMoment = moment(newVal);
      //ask to me explain this and I'll just cry
      var newDate = moment().zone(TIMEZONE_OFFSET)
        .year(newMoment.year())
        .month(newMoment.month())
        .date(newMoment.date())
        .hour(newMoment.hour())
        .minute(newMoment.minute())
        .format(modelDateFormat);
      $scope.article.published = newDate;
    };



  });
