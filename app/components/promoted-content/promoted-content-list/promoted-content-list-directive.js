'use strict';

angular.module('promotedContentList.directive', [
  'bulbsCmsApp.settings',
  'ngDragDrop',
  'promotedContentArticle',
  'promotedContentSave',
  'promotedContentList.controller'
])
  .directive('promotedContentList', function ($, routes) {
    return {
      controller: 'PromotedContentList',
      link: function (scope, element, attr) {

        scope.styleDropZone = function (e) {
          $(e.target).addClass('drop-area-hover');
        };
        scope.destyleDropZones = function (e) {
          $('.content-drop-area, .replace-drop-area').removeClass('drop-area-hover');
        };

      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-list/promoted-content-list.html'
    };
  });
