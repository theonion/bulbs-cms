'use strict';

angular.module('campaigns.edit', [
  'bulbs.cms.config',
  'campaigns.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/cms/app/campaigns/edit/:id/', {
      controller: function ($routeParams, $scope, $window, CmsConfig) {
        $window.document.title = CmsConfig.getCmsName() + ' | Edit Campaign';
        $scope.routeId = $routeParams.id;
      },
      template: '<campaigns-edit model-id="routeId"></campaigns-edit>',
      reloadOnSearch: false
    });
  });
