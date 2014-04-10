'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function (routes) {
    return {
      restrict: 'E',
      templateUrl:  routes.PARTIALS_URL + 'promotion-tool-article-container.html',
      scope: {
        'article': '='
      },
      link: function postLink(scope, element, attrs) {
        scope.ratio = attrs.ratio;
      }
    };
  });
