'use strict';
  /* helpful SO question on injecting $modal into interceptor and doing intercept pass-through
    http://stackoverflow.com/questions/14681654/i-need-two-instances-of-angularjs-http-service-or-what
  */
angular.module('bulbsCmsApp').factory('PermissionsInterceptor', function ($q, $injector, routes) {
  return {
    responseError: function (rejection) {
      if (rejection.config && rejection.config.noPermissionIntercept) {
        return $q.when(rejection);
      } else {
        $injector.invoke(function ($modal) {
          if (rejection.status === 403) {
            if (rejection.data && rejection.data.detail && rejection.data.detail.indexOf('credentials') > 0) {
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/login-modal.html',
                controller: 'LoginmodalCtrl'
              });
            } else {
              var detail = rejection.data && rejection.data.detail || 'Forbidden';
              $modal.open({
                templateUrl: routes.PARTIALS_URL + 'modals/403-modal.html',
                controller: 'ForbiddenmodalCtrl',
                resolve: {
                  detail: function () { return detail; }
                }
              });
            }
          }
        });
        return $q.reject(rejection);
      }
    }
  };
});