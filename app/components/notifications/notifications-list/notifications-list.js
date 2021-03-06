'use strict';

angular.module('notifications.list', [
  'apiServices.notification.factory',
  'bulbs.cms.site.config',
  'listPage',
  'moment',
  'notifications.settings'
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/notifications/', {
        controller: function ($scope, $window, NOTIFICATIONS_LIST_REL_PATH, Notification) {
          $window.document.title = CmsConfig.getCmsName() + ' | Notification';
          $scope.modelFactory = Notification;
          $scope.LIST_URL = CmsConfig.buildExternalUrl(NOTIFICATIONS_LIST_REL_PATH);
        },
        templateUrl: CmsConfig.buildComponentPath('notifications/notifications-list/notifications-list-page.html')
      });
  });
