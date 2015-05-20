'use strict';

angular.module('content.edit.editorItem', [
  'content.edit.editorItem.service',
  'moment'
])
  .directive('editorItem', [
    'EditorItems', 'moment', 'routes',
    function (EditorItems, moment, routes) {
      return {
        restrict: 'E',
        templateUrl: routes.COMPONENTS_URL + 'content/content-edit/content-edit-editor-item/content-edit-editor-item.html',
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {

          EditorItems.getItems(scope.article.id || '');

          scope.editorItems = EditorItems;

          scope.parseCreated = function (date) {
            return moment(date).format('h:mm A MMM D');
          };
        }
      };
    }]);
