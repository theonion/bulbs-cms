'use strict';

angular.module('bulbsCmsApp')
  .controller('CmsNotificationCtrl', function ($scope, moment) {

    var valid = function () {
      $scope.postDateValid = $scope.postDate && (!$scope.notifyEndDate || $scope.postDate < $scope.notifyEndDate);
      $scope.notifyEndDateValid = $scope.notifyEndDate && $scope.postDate && $scope.notifyEndDate > $scope.postDate;
      $scope.titleValid = $scope.cmsNotification.title && $scope.cmsNotification.title.length > 0 && $scope.cmsNotification.title.length <= 110;

      $scope.cmsNotificationValid = $scope.postDateValid && $scope.notifyEndDateValid && $scope.titleValid;
    };

    // Note: use middle man for handling dates since a bug in angular.js version causes moment to not work with
    //  angular.copy. So instead of keeping notification dates as moments, keep them as strings and use moment objects
    //  for interactions.

    $scope.postDate = $scope.cmsNotification.post_date ? moment($scope.cmsNotification.post_date) : null;
    $scope.$watch('postDate', function () {
      if ($scope.postDate) {
        // set notification's post date as the string version of the moment object
        $scope.cmsNotification.post_date = $scope.postDate.format();
        // automatically set the notify end date as 3 days after post date
        $scope.notifyEndDate = $scope.postDate.clone().add({days: 3});
      } else {
        $scope.cmsNotification.post_date = null;
      }
    });

    $scope.notifyEndDate = $scope.cmsNotification.notify_end_date ? moment($scope.cmsNotification.notify_end_date) : null;
    $scope.$watch('notifyEndDate', function () {
      if ($scope.notifyEndDate) {
        // set notification's post date as the string version of the moment object
        $scope.cmsNotification.notify_end_date = $scope.notifyEndDate.format();
      } else {
        $scope.cmsNotification.notify_end_date = null;
      }
    });

    // keep track of changes to this notification
    $scope.cmsNotificationDirty = false;
    $scope.$watch('cmsNotification', function (newValue, oldValue) {
      if (!angular.equals(newValue, oldValue)) {
        $scope.cmsNotificationDirty = true;

        // do some validation here
        valid();

      }
    }, true);

    // do initial validation
    valid();

    /**
     * Save this notification using the parent scope.
     */
    $scope.saveCmsNotification = function () {

      if ($scope.$parent.userIsSuperuser && $scope.cmsNotificationDirty && $scope.cmsNotificationValid) {

        $scope.$parent.$saveCmsNotification($scope.cmsNotification)
          .then(function (newCmsNotification) {
            $scope.cmsNotification = newCmsNotification;
            $scope.cmsNotificationDirty = false;
          })
          .catch(function (error) {
            console.log('CMS Notification save failed', error);
          });

      }

    };

    /**
     * Delete this notification using the parent scope.
     */
    $scope.deleteCmsNotification = function () {

      if ($scope.$parent.userIsSuperuser) {

        $scope.$parent.$deleteCmsNotification($scope.cmsNotification)
          .catch(function (error) {
            console.log('CMS Notification delete failed', error);
          });

      }

    };

  });
