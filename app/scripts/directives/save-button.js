'use strict';

angular.module('bulbsCmsApp')
  .directive('saveButton', function ($q, $timeout, NProgress, routes) {
    return {
      replace: true,
      restrict: 'E',
      templateUrl: routes.PARTIALS_URL + 'save-button.html',
      scope: {
        'getPromise': '&',
        'saveCbk': '&onSave',
        'config': '=?'
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

        NProgress.configure({
          minimum: 0.4
        });

        scope.save = function () {
          NProgress.start();
          element
            .prop('disabled', true)
            .removeClass('btn-danger')
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var save_promise = scope.getPromise();

          var promise = save_promise.then(
            function (result) {
              NProgress.done();
              element
                .prop('disabled', false)
                .removeClass('btn-danger')
                .html('<i class=\'fa fa-check\'></i> ' + scope.config.finished);

              return $timeout(function () {
                element.html(scope.config.idle);
              }, 1000)
              .then(function () {
                return result;
              });
            },
            function (reason) {
              NProgress.done();
              element
                .prop('disabled', false)
                .addClass('btn-danger')
                .html('<i class=\'fa fa-frown-o\' style=\'color:red\'></i> ' + scope.config.error);

              return $q.reject(reason);
            });
          if (scope.saveCbk) {
            scope.saveCbk({promise: promise});
          }
        }
      }
    }
  })
