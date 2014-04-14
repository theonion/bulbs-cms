'use strict';

angular.module('bulbsCmsApp')
  .factory('AdApi', function (Restangular, adApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(adApiConfig.baseUrl);
    });
  })
  .constant('adApiConfig', {
    baseUrl: '/ads'
  });
