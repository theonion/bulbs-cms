'use strict';

angular.module('rateOverrides.list', [
    'apiServices.rateOverride.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/rate-overrides/', {
        controller: function($scope, $window, RateOverride) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Rate Overrides';

          $scope.modelFactory = RateOverride;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-rate-overrides-list/reporting-rate-overrides-list.html'
      });
  });