'use strict';

angular.module('roles.edit.directive', [
  'apiServices.reporting.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar',
  'utils'
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
  .directive('rolesEdit', [
      'COMPONENTS_URL', 'Utils',
      function (COMPONENTS_URL, Utils) {
      return {
        controller: [
          '_', '$location', '$q', '$routeParams', '$scope', 'Role', 'PAYMENT_TYPES',
          function (_, $location, $q, $routeParams, $scope, Role, PAYMENT_TYPES) {

            $scope.page = 'contributions';
            $scope.PAYMENT_TYPES = PAYMENT_TYPES;

            if ($routeParams.id === 'new') {
              $scope.model = Role.$build();
              $scope.isNew = true;
            } else {
              $scope.model = Role.$find($routeParams.id);
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

            $scope.saveModel = function () {
              var promise;

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
          }
        ],
        restrict: 'E',
        scope: {
          getModelId: '&modelId'
        },
        templateUrl: Utils.path.join(
          COMPONENTS_URL,
          'reporting',
          'reporting-roles-edit',
          'reporting-roles-edit.html'
        )
      };
    }
  ]);
