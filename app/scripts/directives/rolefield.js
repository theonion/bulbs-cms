'use strict';

angular.module('bulbsCmsApp')
  .directive('roleField', [
    '$http', 'PARTIALS_URL', 'Raven', 'Utils',
    function ($http, PARTIALS_URL, Raven, Utils) {
      return {
        templateUrl: Utils.path.join(PARTIALS_URL, 'rolefield.html'),
        restrict: 'E',
        replace: true,
        scope: {
          model: '='
        },

        link: function (scope, element, attrs) {
          var resourceUrl = '/cms/api/v1/contributions/role/';

          scope.roleValue = null;
          scope.roleOptions = [];

          scope.$watch('model.role', function () {
            for (var i = 0; i < scope.roleOptions.length; i++) {
              if (scope.roleOptions[i].id === Number(scope.roleValue)) {
                scope.model.role = scope.roleOptions[i];
              }
            }
            scope.roleValue = scope.model.role.id;
          });

          $http({
            method: 'GET',
            url: resourceUrl
          }).success(function (data) {
            scope.roleOptions = data.results || data;
          }).error(function (data, status, headers, config) {
            Raven.captureMessage('Error fetching Roles', {extra: data});
          });
        }
      };
    }
  ]);
