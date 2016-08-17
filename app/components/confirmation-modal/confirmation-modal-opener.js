'use strict';

angular.module('confirmationModal', [
  'confirmationModal.factory',
  'ui.bootstrap'
])
  .directive('confirmationModalOpener', function (ConfirmationModal) {
    return {
      restrict: 'A',
      scope: {
        modalBody: '@',
        modalCancelText: '@',
        modalOkText: '@',
        modalOnCancel: '&',
        modalOnOk: '&',
        modalTitle: '@'
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('confirmation-modal-opener');
        element.on('click', function () {
          modalInstance = new ConfirmationModal(scope);
        });
      }
    };
  });
