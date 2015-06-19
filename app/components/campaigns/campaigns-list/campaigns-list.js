'use strict';

angular.module('campaigns.list', [
  'apiServices.campaign.factory',
  'bulbsCmsApp.settings',
  'listPage',
  'moment'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/campaigns/', {
        controller: function ($scope, $window, Campaign) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Campaign';

          $scope.modelFactory = Campaign;
        },
        templateUrl: routes.COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html'
      });
  });
