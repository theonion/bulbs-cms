'use strict';

angular.module('evergreenField.directive', [
  'bulbsCmsApp.settings',
  'lodash',
  'saveButton.directive',
])
  .directive('evergreenField', [
    'routes',
    function (routes) {
      return {
        restrict: 'E',
        scope: {
          article: '='
        },
        templateUrl: routes.COMPONENTS_URL + 'evergreen-field/evergreen-field.html'
      };
    }
  ]);
