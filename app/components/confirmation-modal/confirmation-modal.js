'use strict';

angular.module('confirmationModal.factory', [
  'bulbsCmsApp.settings',
  'ui.bootstrap.modal'
])
  .factory('ConfirmationModal', function ($modal, COMPONENTS_URL) {

    var ConfirmationModal = function (scope) {
      return (function (scope) {
        $modal
          .open({
            controller: function ($scope, $modalInstance) {
              $scope.confirm = function () {
                $scope.$close();
                if ($scope.modalOnOk) {
                  $scope.modalOnOk();
                }
              };

              $scope.cancel = function () {
                $scope.$dismiss();
                if ($scope.modalOnCancel) {
                  $scope.modalOnCancel();
                }
              };
            },
            scope: scope,
            templateUrl: COMPONENTS_URL + 'confirmation-modal/confirmation-modal.html'
          });
      })(scope);
    };

    return ConfirmationModal;
  });
