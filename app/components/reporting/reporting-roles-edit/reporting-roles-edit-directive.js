'use strict';

angular.module('roles.edit.directive', [
  'apiServices.reporting.factory',
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
  'topBar'
])
  .directive('rolesEdit', function (routes) {
    return {
      controller: function (_, $location, $q, $routeParams, $scope, Role) {
        
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
      },
      restrict: 'E',
      scope: {
        getModelId: '&modelId'
      },
      templateUrl: routes.COMPONENTS_URL + 'reporting/reporting-roles-edit/reporting-roles-edit.html'
    };
  });