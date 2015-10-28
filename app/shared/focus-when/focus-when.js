'use strict';

/**
 * Use as an attribute to focus on a particular field when given condition is true. For example:
 *
 * <div focus-when="showDiv"/>
 *
 * Will focus on this div when showDiv is true.
 */
angular.module('focusWhen', [])
  .directive('focusWhen', function ($timeout) {
    return {
      restrict: 'A',
      scope: {
        trigger: '=focusWhen'
      },
      link: function (scope, element) {
        scope.$watch('trigger', function (value) {
          if (value) {
            $timeout(function () {
              element[0].focus();
            });
          }
        });
      }
    };
  });
