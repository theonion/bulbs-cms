'use strict';

angular.module('specialCoverage.list', [
  'apiServices.specialCoverage.factory',
  'bulbs.cms.config',
  'bulbsCmsApp.settings',
  'listPage',
  'moment',
  'specialCoverage.settings'
])
  .config(function ($routeProvider, routes) {

    $routeProvider
      .when('/cms/app/special-coverage/', {
        controller: function ($scope, $window, CmsConfig, EXTERNAL_URL,
            SPECIAL_COVERAGE_LIST_REL_PATH, SpecialCoverage) {
          $window.document.title = CmsConfig.getCmsName() + ' | Special Coverage';
          $scope.modelFactory = SpecialCoverage;
          $scope.LIST_URL = EXTERNAL_URL + SPECIAL_COVERAGE_LIST_REL_PATH;
        },
        templateUrl: routes.COMPONENTS_URL + 'special-coverage/special-coverage-list/special-coverage-list-page.html'
      });
  });
