'use strict';

angular.module('lineItems.list', [
    'apiServices.lineItem.factory',
    'bulbs.cms.site.config',
    'listPage'
  ])
  .config(function ($injector, $routeProvider, CmsConfigProvider) {
    var CmsConfig = $injector.invoke(CmsConfigProvider.$get);

    $routeProvider
      .when('/cms/app/line-items/', {
        controller: function($modal, $scope, $window, LineItem) {
          $window.document.title = CmsConfig.getCmsName() + ' | Line Items';

          $scope.modelFactory = LineItem;

          $scope.LineItemExportModal = function () {
            return $modal.open({
              templateUrl: '/views/modals/line-item-export-modal.html',
              controller: 'LineitemexportmodalCtrl',
            });
          };

          $scope.utilityButtons = [{
            title: 'Export CSV',
            click: function () {
              $scope.LineItemExportModal();
            },
            buttonClasses: 'add-item btn btn-primary',
            iconClasses: 'font-awesome'
          }];
        },

        templateUrl: CmsConfig.buildComponentPath('reporting/reporting-line-items-list/reporting-line-items-list.html')
      });
  });
