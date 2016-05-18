'use strict';

angular.module('lineItems.list', [
    'apiServices.lineItem.factory',
    'bulbsCmsApp.settings',
    'listPage'
  ])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/line-items/', {
        controller: function($modal, $scope, $window, LineItem) {
          $window.document.title = routes.CMS_NAMESPACE + ' | Line Items';

          $scope.modelFactory = LineItem;

          $scope.lineItemExportModal = function () {
            return $modal.open({
              templateUrl: routes.PARTIALS_URL + 'modals/line-item-export-modal.html',
              controller: 'LineitemexportmodalCtrl',
            });
          };

          $scope.utilityButtons = [{
            title: 'Export CSV',
            click: function () {
              $scope.lineItemExportModal();
            },
            buttonClasses: 'add-item btn btn-primary',
            iconClasses: 'glyphicon'
          }];
        },

        templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-line-items-list/reporting-line-items-list.html'
      });
  });