'use strict';

angular.module('bulbs.cms.titleModal', [
  'bulbs.cms.site.config',
  'ui.bootstrap',
  'ui.bootstrap.modal'
])
  .directive('titleModalOpener', [
    '$modal', 'CmsConfig',
    function ($modal, CmsConfig) {
      return {
        restrict: 'A',
        scope: {
          modalCancelText: '@',
          modalOkText: '@',
          modalOnCancel: '&',
          modalOnOk: '&',
          modalTitle: '@'
        },
        link: function (scope, element) {

          element.addClass('title-modal-opener');
          element.on('click', function () {

            if (!scope.modalInstance) {

              scope.modalInstance = $modal
                .open({
                  scope: scope,
                  templateUrl: CmsConfig.buildComponentPath(
                    'title-modal',
                    'title-modal.html'
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
