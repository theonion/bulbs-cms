'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function () {
    return {
      restrict: 'E',
      templateUrl:  '/views/promotion-tool-article-container.html',
      scope: {
        'article': '='
      },
      link: function postLink(scope, element, attrs) {
        scope.ratio = attrs.ratio;
      }
    };
  });
