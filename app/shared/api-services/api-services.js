'use strict';

angular.module('apiServices', [
  'restmod',
  'apiServices.styles'
])
  .constant('API_URL_ROOT', '/cms/api/v1/')
  .config(function (API_URL_ROOT, restmodProvider) {
    restmodProvider.rebase('DjangoDRFPagedApi', {
      $config: {
        style: 'BulbsApi',
        urlPrefix: API_URL_ROOT
      }
    });
  });
