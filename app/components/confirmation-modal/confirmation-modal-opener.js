'use strict';

angular.module('confirmationModal', [
  'bulbsCmsApp.settings',
  'ui.bootstrap.modal'
])
  .directive('confirmationModalOpener', function ($modal, routes) {
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
          modalInstance = $modal
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
        });
      }
    };
  });
