'use strict';

angular.module('bulbsCmsApp')
  .controller('PubtimemodalCtrl', function ($scope, $http, $modal, $modalInstance, $, moment, Login, routes, article, TIMEZONE_OFFSET) {
    $scope.article = article;

    $scope.$watch('pickerValue', function(newVal){
      var pubTimeMoment = moment(newVal).zone(TIMEZONE_OFFSET);
      $scope.datePickerValue = moment()
        .year(pubTimeMoment.year())
        .month(pubTimeMoment.month())
        .date(pubTimeMoment.date());
      $scope.timePickerValue = moment()
        .hour(pubTimeMoment.hour())
        .minute(pubTimeMoment.minute());
    });

    $modalInstance.result.then(
      function(){ }, //closed
      function(){ //dismissed
        $('#save-pub-time-button').html('Save Changes');
      }
    );

    var viewDateFormat = 'MM/DD/YYYY hh:mm a';
    var modelDateFormat = 'YYYY-MM-DDTHH:mmZ';

    $scope.setTimeShortcut = function (shortcut) {
      if(shortcut == 'now'){
        var now = moment().zone(TIMEZONE_OFFSET);
        $scope.pickerValue = now;
      }
      if(shortcut == 'midnight'){
        var midnight = moment().zone(TIMEZONE_OFFSET).hour(24).minute(0);
        $scope.pickerValue = midnight;
      }
    }

    $scope.setDateShortcut = function (shortcut) {
      var today = moment().zone(TIMEZONE_OFFSET);
      if(shortcut == 'today'){
        $scope.datePickerValue = moment().year(today.year()).month(today.month()).date(today.date());
      }
      if(shortcut == 'tomorrow'){
        $scope.datePickerValue = moment().year(today.year()).month(today.month()).date(today.date() + 1);
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
        $scope.article.published = resp.published;
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

    if($scope.article.published){
      $scope.pickerValue = moment($scope.article.published);
    }else{
      $scope.setTimeShortcut('now');
    }

  });
