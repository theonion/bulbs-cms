'use strict';

angular.module('apiServices', [
  'apiServices.settings',
  'restmod',
  'restmod.styles.drfPaged'
])
  .config(function (API_URL_ROOT, restmodProvider) {
    restmodProvider.rebase('DjangoDRFPagedApi', {
      $config: {
        style: 'BulbsApi',
        urlPrefix: API_URL_ROOT
      }
    });
  });
