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
        controller: [
          '_', '$scope', 'ContentFactory',
          function (_, $scope, ContentFactory) {
          }
        ],
        restrict: 'E',
        scope: {
          content: '='
        },
        templateUrl: routes.COMPONENTS_URL + 'evergreen-field/evergreen-field.html'
      };
    }
  ]);
