'use strict';

angular.module('promotedContentArticle.directive', [
  'bulbsCmsApp.settings'
])
  .directive('promotedContentArticle', function (COMPONENTS_URL) {
    return {
      restrict: 'E',
      scope: {
        article: '='
      },
      templateUrl: COMPONENTS_URL + 'promoted-content/promoted-content-article/promoted-content-article.html'
    };
  });
