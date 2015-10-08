'use strict';

angular.module('lineItems.edit', [
  'lineItems.edit.directive'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
    .when('/cms/app/line-items/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {
        $window.document.title = routes.CMS_NAMESPACE + ' | Edit Line Item';

        $scope.routeId = $routeParams.id;
      },
      template: '<line-items-edit id="routeId"></line-items-edit>',
      reloadOnSearch: false
    });
  });