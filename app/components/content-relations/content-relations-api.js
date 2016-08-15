'use strict';

angular.module('bulbs.cms.content.relations.api', [
  'bulbs.cms.site.config'
])
  .service('ContentRelationsApi', [
    '$http', 'CmsConfig',
    function ($http, CmsConfig) {
      return {
        retrieveRelations: function (id) {
          return $http({
            method: 'GET',
            url: CmsConfig.buildApiUrlRoot(id, 'relations')
          });
        }
      };
    }
  ]);
