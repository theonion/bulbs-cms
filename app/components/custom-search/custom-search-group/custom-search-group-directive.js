'use strict';

angular.module('customSearch.group.directive', [
  'bulbs.cms.site.config',
  'uuid4'
])
  .directive('customSearchGroup', function (CmsConfig) {
    return {
      controller: function ($scope, CustomSearchConfig, uuid4) {
        $scope.data = $scope.controllerService.groupsGet($scope.groupIndex);
        $scope.timePeriods = CustomSearchConfig.getTimePeriods();
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
      templateUrl: CmsConfig.buildComponentPath('custom-search/custom-search-group/custom-search-group.html')
    };
  });
