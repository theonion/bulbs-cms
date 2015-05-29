'use strict';

angular.module('sponsoredContentModal.factory', [
  'ui.bootstrap.modal'
])
  .factory('SponsoredContentModal', function ($modal, routes) {

    var SponsoredContentModal = function (scope) {
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
            templateUrl: routes.SHARED_URL + 'sponsored-content-modal/sponsored-content-modal.html'
          });
      })(scope);
    };

    return SponsoredContentModal;
  });
