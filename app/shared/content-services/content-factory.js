'use strict';

angular.module('contentServices.factory', [
  'bulbs.cms.site.config',
  'restangular'
])
  .factory('ContentFactory', [
    'CmsConfig', 'Restangular',
    function (CmsConfig, Restangular) {
      return Restangular.withConfig(function (RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(CmsConfig.buildApiUrlRoot());
      });
    }
   ]);

