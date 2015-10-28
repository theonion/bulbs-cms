'use strict';

/**
 * List of tag-like things that has remove functionality.
 */
angular.module('tagList', [
  'lodash',
  'utils'
])
  .directive('tagList', [
    'COMPONENTS_URL',
    function (COMPONENTS_URL) {
      return {
        controller: [
          '_', '$scope', 'Utils',
          function (_, $scope, Utils) {
            $scope.remove = function (item) {
              var i = _.findIndex($scope.items, item);
              Utils.removeFrom($scope.items, i);
            };
          }
        ],
        restrict: 'E',
        scope: {
          items: '=',
          itemDisplayFormatter: '&'
        },
        templateUrl: COMPONENTS_URL + 'tag-list/tag-list.html'
      };
    }
  ]);
