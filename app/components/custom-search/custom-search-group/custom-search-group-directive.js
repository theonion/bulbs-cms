'use strict';

angular.module('customSearch.group.directive', [
  'customSearch.settings',
  'uuid4'
])
  .directive('customSearchGroup', function (routes) {
    return {
      controller: function ($scope, CUSTOM_SEARCH_TIME_PERIODS, uuid4) {
        $scope.data = $scope.controllerService.groupsGet($scope.groupIndex);
        $scope.timePeriods = CUSTOM_SEARCH_TIME_PERIODS;
        $scope.uuid = uuid4.generate();

        $scope.$update = function () {
          $scope.controllerService.$groupsUpdateResultCountFor($scope.groupIndex).then(function () {
            $scope.onUpdate();
          });
        };

        $scope.controllerService.$groupsUpdateResultCountFor($scope.groupIndex);
      },
      restrict: 'E',
      scope: {
        controllerService: '=',
        groupIndex: '=',
        remove: '&',
        onUpdate: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'custom-search/custom-search-group/custom-search-group.html'
    };
  });
