'use strict';

angular.module('bulbs.cms.components.createContent.modal', [
  'bulbs.cms.components.createContent.config',
  'bulbs.cms.components.createContent.types.default',
  'ui.bootstrap.modal',
])
  .factory('CreateContentModal', [
    '$modal', 'routes',
    function ($modal, routes) {

      return function (scope) {

        return $modal.open({
          controller: [
            '$modalInstance', '$scope', 'CreateContentConfig',
            function ($modalInstance, $scope, CreateContentConfig) {
              $scope.contentTypes = CreateContentConfig.getContentTypes($scope);
              $scope.currentSelectedParent = $scope.contentTypes[0];

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
