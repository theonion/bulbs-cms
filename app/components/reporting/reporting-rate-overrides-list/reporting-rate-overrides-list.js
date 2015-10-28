'use strict';

angular.module('rateOverrides.list', [
    'apiServices.rateOverride.factory',
    'bulbsCmsApp.settings',
    'listPage',
    'utils'
  ])
  .config([
    '$routeProvider', 'COMPONENTS_URL', 'UtilsProvider',
    function ($routeProvider, COMPONENTS_URL, Utils) {
      $routeProvider
        .when('/cms/app/rate-overrides/', {
          controller: [
            '$scope', '$window', 'RateOverride', 'CMS_NAMESPACE',
            function ($scope, $window, RateOverride, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Rate Overrides';

              $scope.modelFactory = RateOverride;
            }
          ],
          templateUrl: Utils.path.join(
            COMPONENTS_URL,
            'reporting',
            'reporting-rate-overrides-list',
            'reporting-rate-overrides-list.html'
          )
        });
    }
  ]);
