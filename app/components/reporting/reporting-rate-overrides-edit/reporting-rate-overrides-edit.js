'use strict';

angular.module('rateOverrides.edit', [
  'rateOverrides.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/rate-overrides/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Edit Rate Override';
              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<rate-overrides-edit id="routeId"></rate-overrides-edit>',
          reloadOnSearch: false
        });
    }
  ]);
