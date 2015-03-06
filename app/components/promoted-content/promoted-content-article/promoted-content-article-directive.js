'use strict';

angular.module('promotedContentArticle.directive', [
  'bulbsCmsApp.settings'
])
  .directive('promotedContentArticle', function (routes) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-article/promoted-content-article.html'
    };
  });
