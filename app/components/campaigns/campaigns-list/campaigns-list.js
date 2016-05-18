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



          $scope.utilityButtons = [{
            title: 'Export CSV',
            click: function () {
              console.log('I did something');
            },
            iconClasses: 'fa fa-spinner'
          }];
        },
        templateUrl: routes.COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html'
      });
  });
