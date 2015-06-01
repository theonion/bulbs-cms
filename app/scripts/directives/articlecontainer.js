'use strict';

angular.module('bulbsCmsApp')
  .directive('articlecontainer', function (PARTIALS_URL, LOADING_IMG_SRC) {
    return {
      restrict: 'E',
      templateUrl: PARTIALS_URL + 'promotion-tool-article-container.html',
      scope: {
        article: '='
      },
      link: function postLink(scope, element, attrs) {
        scope.LOADING_IMG_SRC = LOADING_IMG_SRC;
        scope.ratio = attrs.ratio;
      }
    };
  });
