'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function (PARTIALS_URL) {
    return {
      restrict: 'E',
      templateUrl:  PARTIALS_URL + 'promotion-tool-article-container.html',
      scope: {
        'article': '='
      },
      link: function postLink(scope, element, attrs) {
        scope.ratio = attrs.ratio;
      }
    };
  });
