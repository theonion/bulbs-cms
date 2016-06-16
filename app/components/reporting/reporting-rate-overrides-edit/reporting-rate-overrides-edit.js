'use strict';

angular.module('rateOverrides.edit', [
  'bulbs.cms.config',
  'rateOverrides.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/cms/app/rate-overrides/edit/:id/', {
        controller: function ($routeParams, $scope, $window, CmsConfig) {
          $window.document.title = CmsConfig.getCmsName() + ' | Edit Rate Override';
          $scope.routeId = $routeParams.id;
        },
        template: '<rate-overrides-edit id="routeId"></rate-overrides-edit>',
        reloadOnSearch: false
      });
  });
