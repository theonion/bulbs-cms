'use strict';

angular.module('promotedContent', [
  'bulbsCmsApp.settings',
  'promotedContentPzoneSelect',
  'promotedContentList',
  'promotedContentSearch',
  'promotedContentTimePicker',
  'promotedContentOperationsList',
  'promotedContent.service'
])
  .config(function ($routeProvider, routes) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: function ($scope, $window, PromotedContentService) {
          // set title
          $window.document.title = routes.CMS_NAMESPACE + ' | Promotion Tool';

          $scope.operationsStale = function () {
            return PromotedContentService.isPZoneOperationsStale();
          };

          $scope.refreshingOperations = false;
          $scope.refreshOperations = function () {

            if (!$scope.refreshingOperations) {
              $scope.refreshingOperations = true;
              PromotedContentService.$refreshOperations()
                .finally(function () {
                  $scope.refreshingOperations = false;
                });
            }
          };
        },
        templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });
