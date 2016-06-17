'use strict';

angular.module('roles.list', [
    'apiServices.reporting.factory',
    'bulbs.cms.site.config',
    'listPage'
  ])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/roles/', {
        controller: function($scope, $window, Role) {
          $window.document.title = CmsConfig.getCmsName() + ' | Roles';
          $scope.modelFactory = Role;
        },
        templateUrl: CmsConfig.buildComponentPath('reporting/reporting-roles-list/reporting-roles-list.html')
      });
  });
