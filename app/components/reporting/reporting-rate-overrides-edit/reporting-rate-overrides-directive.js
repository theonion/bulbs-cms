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
      controller: function (_, $location, $http, $q, $routeParams, $scope, RateOverride, Raven) {
        var resourceUrl = '/cms/api/v1/contributions/role/';

        if ($routeParams.id === 'new') {
          $scope.model = RateOverride.$build();
          $scope.isNew = true;
        } else {
          $scope.model = RateOverride.$find($routeParams.id);
          $scope.model.$promise.then(function () {
            if (($scope.model.hasOwnProperty('role')) && ($scope.model.role !== null)){
              $scope.model.role = $scope.model.role.id;
            }
          });
        }

        $scope.$watch('$scope.model', function() {
          if ($scope.model.$pending.length === 0) {
            $scope.model.role= $scope.model.role.id;
          }
        });

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          delete window.onbeforeunload;
        });

        $scope.getPaymentType = function (roleId) {
          if ($scope.hasOwnProperty('roles')) {
            for (var i = 0; i < $scope.roles.length; i++) {
              if ($scope.roles[i].id === roleId) {
                return $scope.roles[i].payment_type;
              }
            }
            return null;
          }
        };

        $scope.isFeatureRated = function () {
          if ($scope.getPaymentType($scope.model.role) === 'FeatureType'){
            return true;
          }
          return false;
        };

        $scope.isHourlyRated = function () {
          if ($scope.getPaymentType($scope.model.role) === 'Hourly'){
            return true;
          }
          return false;
        };

        $scope.isFlatRated = function () {
          if ($scope.getPaymentType($scope.model.role) === 'Flat Rate'){
            return true;
          }
          return false;
        };

        $scope.getRoles = function () {
          $http({
          method: 'GET',
          url: resourceUrl
            }).success(function (data) {
              $scope.roles = data.results || data;
            }).error(function (data, status, headers, config) {
              Raven.captureMessage('Error fetching Roles', {extra: data});
            });
        };

        $scope.saveModel = function () {
          var promise;

          if ($scope.model) {
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/rate-overrides/edit/' + data.id + '/');
              if (($scope.model.hasOwnProperty('role')) && ($scope.model.role !== null)){
                $scope.model.role = $scope.model.role.id;
              }
            });
          } else {
            var deferred = $q.defer();
            deferred.reject();
            promise = deferred.promise;
          }

          return promise;
        };

        $scope.getRoles();
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-rate-overrides-edit/reporting-rate-overrides-edit.html'
    };
  });