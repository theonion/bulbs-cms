'use strict';

angular.module('promotedContentList.directive', [
  'bulbsCmsApp.settings',
  'promotedContent.service',
  'promotedContentArticle',
  'promotedContentSave',
  'ui.sortable'
])
  .directive('promotedContentList', function ($, routes) {
    return {
      controller: function ($scope, PromotedContentService) {

          $scope.pzoneData = PromotedContentService.getData();

          $scope.moveUp = function (index) {
            PromotedContentService.moveContentUp(index);
          };

          $scope.moveDown = function (index) {
            PromotedContentService.moveContentDn(index);
          };

          $scope.remove = function (article) {
            PromotedContentService.$removeContentFromPZone(article.id);
          };

          $scope.completeAction = function (index) {
            PromotedContentService.$completeContentAction(index);
          };

          $scope.stopAction = function () {
            PromotedContentService.stopContentAction();
          };

          $scope.markDirty = function () {
            PromotedContentService.markDirtySelectedPZone();
          };

      },
      link: function (scope, element, attr) {

        scope.sortableOptions = {
          beforeStop: function (e, ui) {
            ui.helper.css('margin-top', 0);
            ui.item.parent().removeClass('ui-sortable-dragging');
          },
          cancel: '.ui-sortable-unsortable',
          change: function (e, ui) {
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          containment: 'promoted-content-list',
          distance: 3,
          opacity: 0.75,
          placeholder: 'dropzone',
          start: function (e, ui) {
            ui.item.parent().addClass('ui-sortable-dragging');
            ui.helper.css('margin-top', $(window).scrollTop());
          },
          stop: function () {
            scope.markDirty();
          }
        };
      },
      restrict: 'E',
      scope: {},
      templateUrl: routes.COMPONENTS_URL + 'promoted-content/promoted-content-list/promoted-content-list.html'
    };
  });
