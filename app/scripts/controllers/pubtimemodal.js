'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, moment, Login, routes, article, TIMEZONE_OFFSET) {
    $scope.article = article;

    $scope.datePickerValue = $scope.article.published;
    $scope.timePickerValue = $scope.article.published;

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

    $scope.setTimeShortcut = function (shortcut) {
      if(shortcut == 'now'){
        var now = moment().format(modelDateFormat);
        $scope.timePickerValue = now;
        $scope.datePickerValue = now;
      }
      if(shortcut == 'midnight'){
        var midnight = moment().hour(24).minute(0).format(modelDateFormat);
        $scope.timePickerValue = midnight;
        $scope.datePickerValue = midnight;
      }
    }

    $scope.setDateShortcut = function (shortcut) {
      if(shortcut == 'today'){
        $scope.datePickerValue = moment().format(modelDateFormat);
      }
      if(shortcut == 'tomorrow'){
        $scope.datePickerValue = moment().date(moment().date() + 1).format(modelDateFormat);
      }
    }

    $scope.setPubTime = function () {
      //we're planning on making feature_type a db required field
      //but for now we're just validating on the front-end on publish
      if (!$scope.article.feature_type) {
        $modalInstance.dismiss();
        $modal.open({
          templateUrl: routes.PARTIALS_URL + 'modals/pubtime-validation-modal.html'
        });
        return;
      }

      var newDate = moment($scope.datePickerValue);
      var newTime = moment($scope.timePickerValue);
      var newDateTime = moment().zone(TIMEZONE_OFFSET)
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date())
        .hour(newTime.hour())
        .minute(newTime.minute())
        .format(modelDateFormat)
      var data = {published: newDate};

      $('#save-pub-time-button').html('<i class="fa fa-refresh fa-spin"></i> Saving');
      $http({
        url: '/cms/api/v1/content/' + $scope.article.id + '/publish/',
        method: 'POST',
        data: data
      }).success(function (resp) {
        $scope.publishSuccessCbk && $scope.publishSuccessCbk({article: $scope.article, response: resp});
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
