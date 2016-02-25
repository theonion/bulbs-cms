'use strict';

angular.module('evergreenField.directive', [
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
])
  .directive('evergreenField',
    // TODO: akos -- this breaks when using new-style array, "routes" is undefined
    function (routes) {
      return {
        controller: function (_, $scope, ContentFactory) {
        },
        restrict: 'E',
        scope: {
          content: '='
        },
        templateUrl: routes.COMPONENTS_URL + 'evergreen-field/evergreen-field.html'
      };
    }
  );
