'use strict';

angular.module('promotedContentSearch.directive', [
  'bulbsCmsApp.settings',
  'ngDragDrop',
  'statusFilter',
  'filterWidget',
  'promotedContentArticle',
  'promotedContentSearch.controller'
])
  .directive('promotedContentSearch', function ($, routes) {
    return {
      controller: 'PromotedContentSearch',
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-search/promoted-content-search.html'
    };
  });
