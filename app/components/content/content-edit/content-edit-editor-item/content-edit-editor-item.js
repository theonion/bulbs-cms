'use strict';

angular.module('content.edit.editorItem', [
  'bulbsCmsApp.settings',
  'content.edit.editorItem.service',
  'moment'
])
  .directive('editorItem', [
    'EditorItems', 'moment', 'COMPONENTS_URL',
    function (EditorItems, moment, COMPONENTS_URL) {
      return {
        restrict: 'E',
        templateUrl: COMPONENTS_URL + 'content/content-edit/content-edit-editor-item/content-edit-editor-item.html',
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
