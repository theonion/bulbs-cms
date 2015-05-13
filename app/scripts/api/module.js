angular.module('bulbs.api', [
  'restangular',
  'moment'
])
  .constant('RESTANGULAR_API_URL_ROOT', '/cms/api/v1/')
  .config(function (RestangularProvider, RESTANGULAR_API_URL_ROOT) {
    RestangularProvider.setBaseUrl(RESTANGULAR_API_URL_ROOT);
    RestangularProvider.setRequestSuffix('/');
  });
