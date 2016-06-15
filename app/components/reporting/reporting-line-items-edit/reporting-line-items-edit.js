'use strict';

angular.module('lineItems.edit', [
  'bulbs.cms.config',
  'lineItems.edit.directive'
])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/cms/app/line-items/edit/:id/', {
      controller: function ($routeParams, $scope, $window, CmsConfig) {
        $window.document.title = CmsConfig.getCmsName() + ' | Edit Line Item';
        $scope.routeId = $routeParams.id;
      },
      template: '<line-items-edit id="routeId"></line-items-edit>',
      reloadOnSearch: false
    });
  });
