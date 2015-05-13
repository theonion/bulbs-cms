angular.module('bulbs.api', [
  'bulbsCmsApp.settings',
  'restangular',
  'moment'
])
  .config(function (RestangularProvider, RESTANGULAR_API_URL_ROOT) {
    RestangularProvider.setBaseUrl(RESTANGULAR_API_URL_ROOT);
    RestangularProvider.setRequestSuffix('/');
  });
