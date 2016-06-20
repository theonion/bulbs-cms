'use strict';

angular.module('bulbs.cms.editorial.editorItem', [])
  .directive('editorItem', function ($http, EditorItems, moment, routes) {
    return {
      restrict: 'E',
      templateUrl: routes.COMPONENTS_URL + 'editorial/editor-item.html',
      scope: {
        article: "="
      },
      link: function (scope, element, attrs) {

        EditorItems.getItems((scope.article.id || ''));

        scope.editorItems = EditorItems;

        scope.parseCreated = function (date) {
          return moment(date).format('h:mm A MMM D');
        };

        /*\
            These two are really, really bad.

            The EditorItem note is in the form of:

            "Status: {{ status_text }}\n\n{{ note_text }}"

            Parse accordingly.
        \*/

        scope.parseNote = function (note) {
          var parsed = note.split(
            'Status: '                  // Removing 'Status: '
          )[1].split('\n\n');           // Split the note from the status text

          parsed.shift();               // Removing the status_text

          return parsed.join('\n\n');   // In case there are newlines in the note_text
        };

        scope.parseStatus = function (status) {
          var parsed = status.split(
            'Status: '                  // Removing 'Status: '
          )[1].split(
            '\n\n'                      // Split the note from the status text
          ).shift();                    // Get the status_text

          return parsed !== 'N/A' ? parsed : '';
        };
      }
    };
  });
