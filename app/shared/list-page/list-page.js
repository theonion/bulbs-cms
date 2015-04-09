'use strict';

angular.module('listPage', [
  'bulbsCmsApp.settings',
  'confirmationModal',
  'copyButton'
])
  .directive('listPage', function (routes) {
    return {
      controller: function ($scope, $location, $parse) {
        $scope.name = $scope.modelFactory.identity();
        $scope.namePlural = $scope.modelFactory.identity(true);
        $scope.fields = $scope.modelFactory.$fieldDisplays();
        $scope.$list = $scope.modelFactory.$collection();

        $scope.copyContentInContext = function (record) {
          var value = '';
          if ($scope.toolCopyContent) {
             value = $parse($scope.toolCopyContent)({record: record});
          }
          return value;
        };

        $scope.$retrieve = function (params) {
          return $scope.$list.$refresh(params);
        };

        $scope.sortingField = null;
        $scope.sortDirection = 'asc';
        $scope.$sort = function (field) {
          var direction;
          if (field.title === $scope.sortingField) {
            // clicked on same field, make direction opposite of what it is now
            direction = $scope.sortDirection === 'desc' ? 'asc' : 'desc';
          } else {
            // clicked on a different field, start with the opposite of default
            direction = 'desc';
          }

          // do ordering request
          (function (field, direction) {
            $scope.$retrieve({ordering: field.getOrdering(direction)})
              .$then(function () {
                $scope.sortingField = field.title;
                $scope.sortDirection = direction;
              });
          })(field, direction);
        };

        $scope.$add = function () {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/new/');
        };

        $scope.$remove = function (item) {
          item.$destroy();
        };

        $scope.goToEditPage = function (item) {
          $location.path('/cms/app/' + $scope.cmsPage + '/edit/' + item.id + '/');
        };

        $scope.$retrieve();
      },
      restrict: 'E',
      scope: {
        cmsPage: '@',
        modelFactory: '=',
        toolCopyContent: '@'
      },
      templateUrl: routes.SHARED_URL + 'list-page/list-page.html'
    };
  });
