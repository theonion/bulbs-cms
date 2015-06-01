'use strict';

angular.module('sendToEditor.modal.opener', [
  'sendToEditor.modal'
])
  .directive('sendToEditorModalOpener', [
    'SendToEditorModal',
    function (SendToEditorModal) {
      return {
        restrict: 'A',
        scope: {
          article: '=',
          saveArticle: '=',
          publishSuccessCbk: '='
        },
        link: function (scope, element) {
          var modalInstance = null;
          element.addClass('send-to-editor-modal-opener');
          element.on('click', function () {
            scope.saveArticle().then(function () {
              modalInstance = new SendToEditorModal(scope);
            });
          });
        }
      };
    }
  ]);
