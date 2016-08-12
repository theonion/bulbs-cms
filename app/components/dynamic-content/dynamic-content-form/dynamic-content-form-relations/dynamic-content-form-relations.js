'use strict';

angular.module('bulbs.cms.dynamicContent.form.relations', [
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormRelations', [
    'CmsConfig',
    function (CmsConfig) {
      return {
        templateUrl: CmsConfig.buildComponentPath(
          'dynamic-content',
          'dynamic-content-form',
          'dynamic-content-form-relations',
          'dynamic-content-form-relations.html'
        )
      };
    }
  ]);
