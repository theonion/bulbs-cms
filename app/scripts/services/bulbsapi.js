'use strict';

angular.module('bulbsCmsApp')
  .config(function (RestangularProvider, bulbsApiConfig) {
    // This is specific to Django Rest Framework      
    RestangularProvider.setResponseExtractor(function (response, operation, what, url) {
      var newResponse = response;
      if (operation === 'getList') {
        if (typeof response.results !== 'undefined') {
          newResponse = response.results;
          newResponse.metadata = {
            count: response.count,
            next: response.next,
            previous: response.previous
          };
        }
      }
      return newResponse;
    });
    if (bulbsApiConfig.requestSuffix) {
      RestangularProvider.setRequestSuffix(bulbsApiConfig.requestSuffix);
    }
  })
  .constant('bulbsApiConfig', {
    requestSuffix: '/'
  });