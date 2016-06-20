'use strict';

angular.module('campaigns.list', [
  'apiServices.campaign.factory',
  'bulbs.cms.site.config',
  'listPage',
  'moment'
])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/campaigns/', {
        controller: function ($scope, $window, Campaign) {
          $window.document.title = CmsConfig.getCmsName() + ' | Campaign';
          $scope.modelFactory = Campaign;
        },
        templateUrl: CmsConfig.buildComponentPath('campaigns/campaigns-list/campaigns-list-page.html')
      });
  });
