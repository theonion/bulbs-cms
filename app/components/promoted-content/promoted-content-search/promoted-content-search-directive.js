'use strict';

angular.module('promotedContentSearch.directive', [
  'bulbsCmsApp.settings',
  'statusFilter',
  'filterWidget',
  'promotedContentArticle',
  'promotedContentSearch.controller'
])
  .directive('promotedContentSearch', function (routes) {
    return {
      controller: 'PromotedContentSearch',
      link: function (scope, element, attr) {

        scope.tools = null;
        scope.openToolsFor = function (article) {
          scope.tools = article.id;
          return true;
        };

        scope.closeTools = function () {
          scope.tools = null;
          return true;
        };

        scope.toolsOpenFor = function (article) {
          return scope.tools === article.id;
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-search/promoted-content-search.html'
    };
  });
