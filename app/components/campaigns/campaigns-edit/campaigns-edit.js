'use strict';

angular.module('campaigns.edit', [
  'campaigns.edit.directive'
])
  .config(function ($routeProvider, CMS_NAMESPACE) {
    $routeProvider
    .when('/cms/app/campaigns/edit/:id/', {
      controller: function ($routeParams, $scope, $window) {

        // set title
        $window.document.title = CMS_NAMESPACE + ' | Edit Campaign';

        $scope.routeId = $routeParams.id;
      },
      template: '<campaigns-edit model-id="routeId"></campaigns-edit>',
      reloadOnSearch: false
    });
  });
