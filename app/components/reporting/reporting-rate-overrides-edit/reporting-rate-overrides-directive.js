'use strict';

angular.module('rateOverrides.edit.directive', [
  'apiServices.rateOverride.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .directive('rateOverridesEdit', function (routes) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, RateOverride) {
        if ($routeParams.id === 'new') {
          $scope.model = RateOverride.$build();
          $scope.isNew = true;
        } else {
          $scope.model = RateOverride.$find($routeParams.id);
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
              $location.path('/cms/app/rate-overrides/edit/' + data.id + '/');
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
      templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-rate-overrides-edit/reporting-rate-overrides-edit.html'
    };
  });