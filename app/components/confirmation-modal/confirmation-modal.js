'use strict';

angular.module('confirmationModal.factory', [
  'bulbs.cms.config',
  'ui.bootstrap.modal'
])
  .factory('ConfirmationModal', function ($modal, CmsConfig) {

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
            templateUrl: CmsConfig.buildComponentPath('confirmation-modal/confirmation-modal.html')
          });
      })(scope);
    };

    return ConfirmationModal;
  });
