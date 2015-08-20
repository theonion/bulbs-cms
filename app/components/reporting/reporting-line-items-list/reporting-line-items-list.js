'use strict';

angular.module('lineItems.list', [
    'apiServices.lineItem.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/line-items/', {
        controller: function($scope, $window, LineItem) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Line Items';

          $scope.modelFactory = LineItem;
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-line-items-list/reporting-line-items-list.html'
      });
  });