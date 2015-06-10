'use strict';

angular.module('reporting', [
  'reporting.directive'
])
  .config([
    '$routeProvider', 'COMPONENTS_URL',
    function ($routeProvider, COMPONENTS_URL) {

      $routeProvider
        .when('/cms/app/reporting/', {
          controller: [
            '$window', 'CMS_NAMESPACE',
            function ($window, CMS_NAMESPACE) {
              // set title
              $window.document.title = CMS_NAMESPACE + ' | Reporting';
            }
          ],
          templateUrl: COMPONENTS_URL + 'reporting/reporting-page.html'
        });
    }
  ]);
