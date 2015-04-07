'use strict';

angular.module('confirmationModal.factory', [
  'ui.bootstrap.modal'
])
  .factory('ConfirmationModal', function ($modal, routes) {

    var ConfirmationModal = function (scope) {
      return (function (scope) {
        $modal
          .open({
            controller: function ($scope, $modalInstance) {
              $scope.confirm = function () {
                $scope.$close();
                $scope.modalOnOk();
              };

              $scope.cancel = function () {
                $scope.$dismiss();
                $scope.modalOnCancel();
              };
            },
            scope: scope,
            templateUrl: routes.COMPONENTS_URL + 'confirmation-modal/confirmation-modal.html'
          });
      })(scope);
    };

    return ConfirmationModal;
  });
