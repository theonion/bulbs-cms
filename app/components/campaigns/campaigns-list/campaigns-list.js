'use strict';

angular.module('campaigns.list', [
  'apiServices.campaign.factory',
  'bulbsCmsApp.settings',
  'listPage'
])
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/campaigns/', {
        controller: function ($scope, $window, Campaign) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Campaign';

          $scope.modelFactory = Campaign;
        },
        templateUrl: COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html'
      });
  });
