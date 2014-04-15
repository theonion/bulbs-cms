'use strict';

angular.module('bulbsCmsApp')
  .factory('PromotionApi', function (Restangular, promotionApiConfig) {
    return Restangular.withConfig(function (RestangularConfigurer) {
      RestangularConfigurer.setBaseUrl(promotionApiConfig.baseUrl);
    });
  })
  .constant('promotionApiConfig', {
    baseUrl: '/promotions/api'
  });
