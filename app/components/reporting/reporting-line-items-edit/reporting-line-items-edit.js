'use strict';

angular.module('lineItems.edit', [
  'lineItems.edit.directive'
])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/cms/app/line-items/edit/:id/', {
          controller: [
            '$routeParams', '$scope', '$window', 'CMS_NAMESPACE',
            function ($routeParams, $scope, $window, CMS_NAMESPACE) {
              $window.document.title = CMS_NAMESPACE + ' | Edit Line Item';

              $scope.routeId = $routeParams.id;
            }
          ],
          template: '<line-items-edit id="routeId"></line-items-edit>',
          reloadOnSearch: false
        });
    }
  ]);
