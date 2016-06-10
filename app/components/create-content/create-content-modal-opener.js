'use strict';

angular.module('bulbs.cms.components.createContent.modal.opener', [
  'bulbs.cms.components.createContent.modal'
])
  .directive('createContentModalOpener', [
    'CreateContentModal',
    function (CreateContentModal) {
      return {
        restrict: 'A',
        scope: {},
        link: function (scope, element) {
          var modalInstance = null;

          element.addClass('confirmation-modal-opener');
          element.on('click', function () {
            if (!modalInstance) {
              modalInstance = new CreateContentModal(scope);
              modalInstance.result.finally(function () {
                modalInstance = null;
              });
            }
          });
        }
      };
    }
  ]);
