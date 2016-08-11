'use strict';

angular.module('notifications.edit', [
  'bulbs.cms.site.config',
  'notifications.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/cms/app/notification/edit/:id/', {
        controller: function ($routeParams, $scope, $window, CmsConfig) {
          $window.document.title = CmsConfig.getCmsName() + ' | Edit Notification';
          $scope.routeId = $routeParams.id;
        },
        template: '<notifications-edit model-id="routeId"></notifications-edit>',
        reloadOnSearch: false
      });
  });
