'use strict';

angular.module('rateOverrides.list', [
    'apiServices.rateOverride.factory',
    'bulbs.cms.config',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/rate-overrides/', {
        controller: function($scope, $window, CmsConfig, RateOverride) {
          $window.document.title = CmsConfig.getCmsName() + ' | Rate Overrides';
          $scope.modelFactory = RateOverride;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-rate-overrides-list/reporting-rate-overrides-list.html'
      });
  });
