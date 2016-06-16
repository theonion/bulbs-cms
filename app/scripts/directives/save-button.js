'use strict';

angular.module('bulbsCmsApp')
  .directive('saveButtonOld', function ($q, $timeout, $window) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: '/views/save-button.html',
      scope: {
        'getPromise': '&',
        'saveCbk': '&onSave',
        'config': '=?',
        'colors': '@?colorStyling'
      },
      link: function (scope, element, attrs) {
        scope.colors_tmp = scope.colors;

        attrs.$observe('config', function (val) {
          if (!angular.isDefined(val)) {
            scope.config = {
              idle: '<i class=\'glyphicon glyphicon-floppy-disk\'></i> Save',
              busy: 'Saving',
              finished: 'Saved',
              error: 'Error'
            };
          }
        });

        scope.save = function () {
          if (attrs.confirmClickWith) {
            var message = attrs.confirmClickWith;
            if (!$window.confirm(message)) { return; }
          }

          scope.colors = scope.colors_tmp;
          element
            .prop('disabled', true)
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var save_promise = scope.getPromise();

          var saveSuccess = function (result) {
            scope.colors = scope.colors_tmp;
            element
              .prop('disabled', false)
              .html('<i class=\'glyphicon glyphicon-ok\'></i> ' + scope.config.finished);

            return $timeout(function () {
              element.html(scope.config.idle);
            }, 1000)
            .then(function () {
              return result;
            });
          };

          if (save_promise) {
            var promise = save_promise
            .then(saveSuccess)
            .catch(
              function (reason) {
                scope.colors = 'btn-danger';
                element
                  .prop('disabled', false)
                  .html('<i class=\'glyphicon glyphicon-remove\'></i> ' + scope.config.error);

                return $q.reject(reason);
              });
            if (scope.saveCbk) {
              scope.saveCbk({promise: promise});
            }
          } else {
            // no save promise was set, just run success function
            saveSuccess();
          }
        };
      }
    };
  });
