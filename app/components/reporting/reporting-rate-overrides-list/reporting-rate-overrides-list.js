'use strict';

angular.module('rateOverrides.list', [
    'apiServices.rateOverride.factory',
    'bulbs.cms.config',
    'listPage'
  ])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/rate-overrides/', {
        controller: function($scope, $window, RateOverride) {
          $window.document.title = CmsConfig.getCmsName() + ' | Rate Overrides';
          $scope.modelFactory = RateOverride;
        },

        templateUrl: CmsConfig.buildComponentPath('reporting/reporting-rate-overrides-list/reporting-rate-overrides-list.html')
      });
  });
