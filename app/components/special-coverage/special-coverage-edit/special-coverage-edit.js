'use strict';

angular.module('specialCoverage.edit', [
  'bulbs.cms.site.config',
  'specialCoverage.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/cms/app/special-coverage/edit/:id/', {
        controller: function ($routeParams, $scope, $window, CmsConfig) {
          $window.document.title = CmsConfig.getCmsName() + ' | Edit Special Coverage';
          $scope.routeId = $routeParams.id;
        },
        template: '<special-coverage-edit model-id="routeId"></special-coverage-edit>'
      });
  });
