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
        'config': '=?',
        'styling': '@?addClasses'
      },
      link: function (scope, element, attrs) {
        scope.styling_tmp = scope.styling;

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

        NProgress.configure({
          minimum: 0.4
        });

        scope.save = function () {
          NProgress.start();
          scope.styling = scope.styling_tmp;
          element
            .prop('disabled', true)
            .html('<i class=\'fa fa-refresh fa-spin\'></i> ' + scope.config.busy);

          var save_promise = scope.getPromise();

          var promise = save_promise
          .then(
            function (result) {
              NProgress.done();
              scope.styling = scope.styling_tmp;
              element
                .prop('disabled', false)
                .html('<i class=\'glyphicon glyphicon-ok\'></i> ' + scope.config.finished);

              return $timeout(function () {
                element.html(scope.config.idle);
              }, 1000)
              .then(function () {
                return result;
              });
            })
          .catch(
            function (reason) {
              NProgress.done();
              scope.styling = 'btn-danger';
              element
                .prop('disabled', false)
                .html('<i class=\'glyphicon glyphicon-remove\'></i> ' + scope.config.error);

              return $q.reject(reason);
            });
          if (scope.saveCbk) {
            scope.saveCbk({promise: promise});
          }
        }
      }
    }
  })
