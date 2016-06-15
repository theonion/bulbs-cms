'use strict';

angular.module('lineItems.edit.directive', [
  'apiServices.lineItem.factory',
  'bulbs.cms.site.config',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .directive('lineItemsEdit', function (CmsConfig) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, LineItem) {
        if ($routeParams.id === 'new') {
          $scope.model = LineItem.$build();
          $scope.isNew = true;
        } else {
          $scope.model = LineItem.$find($routeParams.id);
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          delete window.onbeforeunload;
        });

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/line-items/edit/' + data.id + '/');
            });
          } else {
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: CmsConfig.buildComponentPath('reporting/reporting-line-items-edit/reporting-line-items-edit.html')
    };
  });
