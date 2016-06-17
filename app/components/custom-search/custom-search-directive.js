'use strict';

angular.module('customSearch.directive', [
  'bulbs.cms.site.config',
  'customSearch.contentItem',
  'customSearch.group',
  'customSearch.service',
  'customSearch.simpleContentSearch'
])
  .directive('customSearch', function (CmsConfig) {
    return {
      controller: function (_, $scope, CustomSearchService) {

        $scope.customSearchService = new CustomSearchService();

        $scope.resetFilters = function () {
          $scope.customSearchService.setPage(1);
          $scope.customSearchService.setQuery('');
          $scope.addedFilterOn = false;
          $scope.removedFilterOn = false;
        };

        $scope.$conditionalContentRetrieve = function () {
          if ($scope.addedFilterOn) {
            // included filter is on, use retrieval by included
            $scope.customSearchService.$filterContentByIncluded();
          } else if ($scope.removedFilterOn) {
            // excluded filter is on, use retrieval by excluded
            $scope.customSearchService.$filterContentByExcluded();
          } else {
            // no query entered, any request should go to page one
            $scope.customSearchService.$retrieveContent();
          }
        };

        $scope.$contentRetrieve = function () {
          $scope.customSearchService.$retrieveContent();
          $scope.onUpdate();
        };
      },
      link: function(scope, iElement, iAttrs, ngModelCtrl) {

        ngModelCtrl.$formatters.push(function (modelValue) {
          scope.customSearchService.data(modelValue);
          scope.customSearchService.$retrieveContent();
        });

      },
      require: 'ngModel',
      restrict: 'E',
      scope: {
        onUpdate: '&'
      },
      templateUrl: CmsConfig.buildComponentPath('custom-search/custom-search.html')
    };
  });
