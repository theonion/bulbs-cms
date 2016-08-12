'use strict';

angular.module('bulbs.cms.dynamicContent.api', [
  'bulbs.cms.site.config'
])
  .service('DynamicContentApi', [
    '$http', 'CmsConfig',
    function ($http, CmsConfig) {
      return {
        retrieveSchema: function (url) {
          return $http({
            method: 'OPTIONS',
            url: url
          });
        },
        retrieveRelations: function (id) {
          return $http({
            method: 'GET',
            url: CmsConfig.buildApiUrlRoot(id, 'relations')
          });
        }
      };
    }
  ]);
