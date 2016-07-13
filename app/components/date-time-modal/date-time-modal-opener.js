'use strict';

/**
 * Directive to apply as an attribute to an element, that when clicked, will open a datetime selection modal. Modal
 *  functionality is dependent on all dates being moment objects.
 */
angular.module('bulbs.cms.dateTimeModal.opener', [
  'bulbs.cms.dateTimeModal.controller',
  'bulbs.cms.site.config',
  'ui.bootstrap.modal'
])
  .directive('datetimeSelectionModalOpener', [
    '$modal', 'CmsConfig',
    function ($modal, CmsConfig) {
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
                templateUrl: CmsConfig.buildComponentPath(
                  'date-time-modal',
                  'date-time-modal.html'
                ),
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
    }
  ]);
