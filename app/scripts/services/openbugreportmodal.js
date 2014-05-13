'use strict';

angular.module('bulbsCmsApp')
  .factory('openBugReportModal', function ($modal, $window, routes) {
    var openBugReportModal = function () {

      return $modal.open({
        templateUrl: routes.PARTIALS_URL + "modals/bug-report-modal.html",
        controller: 'BugReportModalCtrl'
      }).result;

    };
    /*\
      This is being used in $httpProvider.interceptors. Since
      $modal depends on $http, it cannot be injected into the
      interceptor because it creates a circular dependency.
      So, exposing on the global window instead.
    \*/
    $window.openBugReportModal = openBugReportModal;
    console.log('here')
    return openBugReportModal;
  });
