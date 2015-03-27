'use strict';

angular.module('campaigns.list', [
  'bulbsCmsApp.settings',
  'campaigns.list.directive'
])
.config(function ($routeProvider, routes) {
  $routeProvider
  .when('/cms/app/campaigns/', {
    controller: function ($window) {
      // set title
      $window.document.title = routes.CMS_NAMESPACE + ' | Campaign';
    },
    templateUrl: routes.COMPONENTS_URL + 'campaigns/campaigns-list/campaigns-list-page.html',
    reloadOnSearch: false
  });
});
