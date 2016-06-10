'use strict';

angular.module('bulbs.cms.components.createContent.modal', [
  'ui.bootstrap.modal'
])
  .factory('CreateContentModal', [
    '$modal', 'routes',
    function ($modal, routes) {

      return function (scope) {
        return $modal.open({
          controller: [
            '$modalInstance', '$scope',
            function ($modalInstance, $scope) {
              $scope.confirm = function () {
                // TODO : fill this in
                alert('confirmed');
              };

              $scope.cancel = function () {
                $scope.$dismiss();
              };
            }
          ],
          scope: scope,
          templateUrl: routes.COMPONENTS_URL + 'create-content/create-content-modal.html'
        });
      };
    }
  ]);
