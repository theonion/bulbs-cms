'use strict';

/**
 * Directive to apply as an attribute to an element, that when clicked, will open a datetime selection modal. Modal
 *  functionality is dependent on all dates being moment objects.
 */
angular.module('bulbsCmsApp')
  .directive('datetimeSelectionModalOpener', function ($modal, routes) {
    return {
      restrict: 'A',
      scope: {
        modDatetime: '=?ngModel',
        modalTitle: '@',
        modalOnClose: '&'
      },
      link: function (scope, element) {
        var modalInstance = null;
        element.addClass('datetime-selection-modal-opener');
        element.on('click', function () {
          modalInstance = $modal
            .open({
              templateUrl: routes.PARTIALS_URL + 'modals/datetime-selection-modal.html',
              controller: 'DatetimeSelectionModalCtrl',
              scope: scope
            });
          modalInstance.result
            .then(function (newDate) {
              scope.modDatetime = newDate;
              scope.modalOnClose({newDate: newDate});
            });
        });
      }
    };
  });
