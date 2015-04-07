'use strict';

angular.module('confirmationModal', [
  'bulbsCmsApp.settings',
  'confirmationModal.factory'
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
