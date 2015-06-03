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
  .config(function ($routeProvider, COMPONENTS_URL, CMS_NAMESPACE) {
    $routeProvider
      .when('/cms/app/promotion/', {
        controller: function ($scope, $window, PromotedContentService) {
          // set title
          $window.document.title = CMS_NAMESPACE + ' | Promotion Tool';

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
        templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content.html',
        reloadOnSearch: false
      });
  });
