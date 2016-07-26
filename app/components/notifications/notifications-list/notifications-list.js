'use strict';

angular.module('notifications.list', [
  'apiServices.notification.factory',
  'bulbs.cms.site.config',
  'listPage',
  'notifications.settings'
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/notification/', {
        controller: function ($scope, $window, SECTIONS_LIST_REL_PATH, Notification) {
          $window.document.title = CmsConfig.getCmsName() + ' | Notification';
          $scope.modelFactory = Notification;
          $scope.LIST_URL = CmsConfig.buildExternalUrl(SECTIONS_LIST_REL_PATH);
        },
        templateUrl: CmsConfig.buildComponentPath('notifications/notifications-list/notifications-list-page.html')
      });
  });
