'use strict';

angular.module('roles.edit.directive', [
  'apiServices.reporting.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .constant('PAYMENT_TYPES', [
    {
      name: 'Flat Rate',
      value: 'Flat Rate'
    },
    {
      name: 'FeatureType',
      value: 'FeatureType'
    },
    {
      name: 'Hourly',
      value: 'Hourly'
    },
    {
      name: 'Manual',
      value: 'Manual'
    }
  ])
  .directive('rolesEdit', function (routes) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, Role, FeatureTypeRate, PAYMENT_TYPES) {

        $scope.page = 'contributions';
        $scope.PAYMENT_TYPES = PAYMENT_TYPES;

        if ($routeParams.id === 'new') {
          $scope.model = Role.$build();
          $scope.isNew = true;
        } else {
          $scope.model = Role.$find($routeParams.id).$then(function () {
            $scope.model.feature_type_rates.$fetch();
            $scope.model.flat_rates.$fetch();
            $scope.model.hourly_rates.$fetch();
          });
        }

        window.onbeforeunload = function (e) {
          if (!_.isEmpty($scope.model.$dirty()) || $scope.isNew || $scope.needsSave) {
            return 'You have unsaved changes.';
          }
        };

        $scope.$on('$destroy', function() {
          delete window.onbeforeunload;
        });

        $scope.rateEditable = function () {
          var paymentTypes = PAYMENT_TYPES.slice(0, 3);
          if (paymentTypes.indexOf($scope.model.paymentType >= 0)) {
            return true;
          }

          return false;
        };

        $scope.getFeatureTypeRate = function () {
          return FeatureTypeRate.get();
        };

        $scope.getDirtyRates = function () {
          var dirty = [];
          // // Validate if flat_rate is dirty
          if ($scope.model.hasOwnProperty('flat_rate') && !_.isEmpty($scope.model.flat_rate.$dirty())) {
            dirty.push($scope.model.flat_rate);
          }

          // Validate if hourly_rate is dirty
          if ($scope.model.hasOwnProperty('hourly_rate')) {
            if (!_.isEmpty($scope.model.hourly_rate.$dirty())) {
              dirty.push($scope.model.hourly_rate);
            }
          }

          // Validate if feature_type_rates are dirty
          for (var i = 0; i<$scope.model.feature_type_rates.length; i++) {
            if (!_.isEmpty($scope.model.feature_type_rates[i].$dirty())) {
              dirty.push($scope.model.feature_type_rates[i]);
            }
          }
          return dirty;
        };

        $scope.saveDirtyRates = function () {
          var dirtyRates = $scope.getDirtyRates();
          for (var i=0; i<dirtyRates.length; i++) {
            dirtyRates[i].$save();
          }
        };

        $scope.saveModel = function () {
          var promise;

          $scope.saveDirtyRates();
          if ($scope.model) {
            promise = $scope.model.$save().$asPromise().then(function (data) {
              $location.path('/cms/app/roles/edit/' + data.id + '/');
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
      templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-roles-edit/reporting-roles-edit.html'
    };
  });