'use strict';

angular.module('bulbsCmsApp')
  .directive('targeting', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'targeting.html',
      link: function (scope, element, attrs) {
        scope.addTargetingRow = function (index) {
          scope.targetingArray.push([]);
        };
        scope.removeTargetingRow = function (index) {
          scope.targetingArray.splice(index, 1);
        };
      }
    };
  });
