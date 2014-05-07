'use strict';

angular.module('bulbsCmsApp')
  .directive('saveButton', function ($q, $timeout, routes) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'save-button.html',
      scope: {
        'getPromises': '&',
        'saveCbk': '&onSave',
        'config': '@'
      },
      link: function (scope, element, attrs) {

        attrs.$observe('config', function (val) {
          if (!angular.isDefined(val)) {
            scope.config = {
              idle: 'Save',
              busy: 'Saving',
              finished: 'Saved!',
              error: 'Error!'
            };
          }
        });

        scope.save = function () {
          element
            .prop('disabled', true)
            .removeClass('btn-danger')
            .addClass('btn-success')
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var combined = $q.all(scope.getPromises());

          var promise = combined.then(
            function (result) {
              element
                .prop('disabled', false)
                .removeClass('btn-danger')
                .addClass('btn-success')
                .html('<i class=\'fa fa-check\' style=\'color:green\'></i> ' + scope.config.finished);

              $timeout(function () {
                element.html(scope.config.idle);
              }, 1000);

              return result;
            },
            function (reason) {
              element
                .prop('disabled', false)
                .removeClass('btn-success')
                .addClass('btn-danger')
                .html('<i class=\'fa fa-frown-o\' style=\'color:red\'></i> ' + scope.config.error);

              return reason;
            });
          if (scope.saveCbk) {
            scope.saveCbk(promise);
          }
        }
      }
    }
  })
