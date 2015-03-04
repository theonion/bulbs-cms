'use strict';

angular.module('customSearch.query.directive', [
  'customSearch.settings',
  'customSearch.query.condition',
  'uuid4'
])
  .directive('customSearchQuery', function (routes) {
    return {
      controller: function ($scope, CUSTOM_SEARCH_TIME_PERIODS, uuid4) {
        $scope.timePeriods = CUSTOM_SEARCH_TIME_PERIODS;

        $scope.uuid = uuid4.generate();
      },
      restrict: 'E',
      scope: {
        model: '=',
        remove: '&',
        onUpdate: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-query/custom-search-query.html'
    };
  });
