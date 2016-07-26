'use strict';

angular.module('notifications.edit.directive', [
  'apiServices.notification.factory',
  'BettyCropper',
  'bulbs.cms.site.config',
  'copyButton',
  'customSearch',
  'lodash',
  'saveButton.directive',
  'notifications.settings',
  'topBar'
])
  .directive('notificationsEdit', function (CmsConfig) {
    return {
      controller: function (_, $location, $q, $scope, NOTIFICATIONS_LIST_REL_PATH, Notification) {

        $scope.LIST_URL = CmsConfig.buildExternalUrl(NOTIFICATIONS_LIST_REL_PATH);

        $scope.needsSave = false;

        var modelId = $scope.getModelId();
        if (modelId === 'new') {
          // this is a new notification, build it
          $scope.model = Notification.$build();
          $scope.isNew = true;
        } else {
          // this is an existing special coverage, find it
          $scope.model = Notification.$find($scope.getModelId());
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            // unsaved changes, show confirmation alert
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          // ensure even is cleaned up when we leave
          delete window.onbeforeunload;
        });

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            // have model, use save promise as deferred
            promise = $scope.model.$save().$asPromise().then(function (data) {
              if (modelId === 'new') {
                $location.path('/cms/app/notification/edit/' + data.id + '/');
              }
              $scope.isNew = false;
              $scope.needsSave = false;
            });
          } else {
            // no model, this is an error, defer and reject
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: CmsConfig.buildComponentPath('notifications/notifications-edit/notifications-edit.html')
    };
  });
