'use strict';

angular.module('campaigns.list', [
  'apiServices.campaign.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'listPage',
  'moment'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/campaigns/', {
        controller: function ($scope, $window, Campaign, CmsConfig) {
          $window.document.title = CmsConfig.getCmsName() + ' | Campaign';
          $scope.modelFactory = Campaign;
        },
        templateUrl: routes.COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html'
      });
  });
