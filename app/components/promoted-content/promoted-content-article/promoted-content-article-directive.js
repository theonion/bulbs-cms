'use strict';

angular.module('promotedContentArticle.directive', [
  'bulbsCmsApp.settings',
  'promotedContentArticle.controller'
])
  .directive('promotedContentArticle', function (routes) {
    return {
      controller: 'PromotedContentArticle',
      restrict: 'E',
      scope: {
        article: '=',
        isFirst: '=?',
        isLast: '=?',
        moveUpCallback: '&',
        moveDownCallback: '&'
      },
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-article/promoted-content-article.html'
    };
  });
