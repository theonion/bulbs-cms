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
    '$modal', '$q', 'CmsConfig',
    function ($modal, $q, CmsConfig) {
      return {
        restrict: 'A',
        scope: {
          modalClearText: '@',
          modalOkText: '@',
          modDatetime: '=?ngModel',
          modalTitle: '@',
          modalOnBeforeClose: '&',
          modalOnClear: '&',
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
                return $q.when(scope.modalOnBeforeClose({ newDate: newDate }))
                  .then(function (result) {

                    if (result !== false) {
                      scope.modDatetime = newDate;
                      if (newDate) {
                        scope.modalOnClose({ newDate: newDate });
                      } else {
                        scope.modalOnClear();
                      }
                    }
                  });
              });
          });
        }
      };
    }
  ]);
