'use strict';

angular.module('bulbsCmsApp')
  .directive('roleField', function ($http, routes, $, Raven) {
    return {
      templateUrl: routes.PARTIALS_URL + 'rolefield.html',
      restrict: 'E',
      replace: true,
      scope: {
        model: '='
      },

      link: function (scope, element, attrs) {
        var resourceUrl = '/cms/api/v1/contributions/role/';
        scope.roleValue = scope.model.role.id || null;

        $http({
          method: 'GET',
          url: resourceUrl
        }).success(function (data) {
          scope.roleOptions = data.results || data;
        }).error(function (data, status, headers, config) {
          Raven.captureMessage('Error fetching Roles', {extra: data});
        });

        scope.$watch('roleValue', function () {
          var b = 0;
          for (var i = 0; i < scope.roleOptions.length; i++) {
            if (scope.roleOptions[i].id === Number(scope.roleValue)) {
              scope.model.role = scope.roleOptions[i];
            }
          }
        });
      }
    };
  });