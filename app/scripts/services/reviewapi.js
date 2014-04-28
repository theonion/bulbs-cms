'use strict';

angular.module('bulbsCmsApp')
  .factory('ReviewApi', function (Restangular, reviewApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(reviewApiConfig.baseUrl);
    });
  })
  .constant('reviewApiConfig', {
    baseUrl: '/reviews/api/v1',
  });
