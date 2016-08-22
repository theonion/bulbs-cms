'use strict';

angular.module('bulbs.cms.sendToEditorModal', [
  'bulbs.cms.sendToEditorModal.api',
  'bulbs.cms.site.config',
  'Raven',
  'ui.bootstrap',
  'ui.bootstrap.modal'
])
  .directive('sendToEditorModalOpener', [
    '$modal', 'CmsConfig', 'SendToEditorApi', 'Raven',
    function ($modal, CmsConfig, SendToEditorApi, Raven) {
      return {
        restrict: 'A',
        scope: {
          modalArticle: '=',
          modalOnCancel: '&',
          modalOnOk: '&'
        },
        link: function (scope, element) {

          scope.statuses = CmsConfig.getArticleEditoralStatuses();

          element.addClass('send-to-editor-modal-opener');
          element.on('click', function () {

            if (!scope.modalInstance) {

              scope.sendToEditor = function (status, note) {
                return SendToEditorApi.sendToEditor(
                  scope.modalArticle,
                  status,
                  note
                )
                .then(scope.modalInstance.close)
                .catch(function (response) {
                  Raven.captureMessage('Error attempting to send to editor', {
                    response: response
                  });
                  scope.errorMessage = 'An error occurred!';
                });
              };

              scope.modalInstance = $modal
                .open({
                  scope: scope,
                  templateUrl: CmsConfig.buildComponentPath(
                    'send-to-editor-modal',
                    'send-to-editor-modal.html'
                  )
                });

              scope.modalInstance.result
                .then(scope.modalOnOk)
                .catch(scope.modalOnCancel)
                .finally(function () {
                  scope.modalInstance = false;
                });
            }
          });
        }
      };
    }
  ]);
