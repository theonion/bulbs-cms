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
        modDatetime: '=ngModel',
        modalTitle: '@',
        beforeOpenCallback: '@',
        closeCallback: '@'
      },
      require: '^ngModel',
      link: function (scope, element) {
        var modalInstance = null;
        element.on('click', function () {
          modalInstance = $modal
            .open({
              templateUrl: routes.PARTIALS_URL + 'modals/datetime-selection-modal.html',
              controller: 'DatetimeSelectionModalCtrl',
              scope: scope
            });
          modalInstance.result
            .then(function (newDate) {
              if (scope.closeCallback) {
                scope.closeCallback(newDate)
              } else {
                scope.modDatetime = newDate;
              }
            });
        });
      }
    };
  });