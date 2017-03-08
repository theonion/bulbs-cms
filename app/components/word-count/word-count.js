'use strict';

angular.module('bulbs.cms.wordCount', [
  'jquery'
])
  .directive('wordCount', [
    '$', '$interval',
    function ($, $interval) {

      return {
        link: function (scope, element) {

          var calcWordCount = function () {
            return $(scope.textContainers)
              .toArray()
              .reduce(function (count, element) {
                return count + $(element).text().split(' ').length;
              }, 0);
          };

          var initializer = $interval(function () {
            var wordCount = calcWordCount();

            if (wordCount > 0) {
              $interval.cancel(initializer);
            }

            scope.wordCount = wordCount;
          }, 1000);

          $(document).on('keyup', scope.textContainers, function () {
            scope.wordCount = calcWordCount();
          });
        },
        restrict: 'E',
        scope: {
          textContainers: '@'
        },
        template: '{{ wordCount || 0 }}'
      };
    }
  ]);
