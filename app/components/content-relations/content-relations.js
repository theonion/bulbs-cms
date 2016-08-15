'use strict';

angular.module('bulbs.cms.content.relations', [
  'bulbs.cms.content.relations.api',
  'bulbs.cms.site.config'
])
  .directive('dynamicContentFormRelations', [
    'CmsConfig', 'ContentRelationsApi',
    function (CmsConfig, ContentRelationsApi) {
      return {
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {
          // TODO :
          //    0. finish mocking relations data
          //    1. make request to relations endpoint
          //    2. render relations

          ContentRelationsApi.retrieveRelations(scope.article.id)
            .then(function () {
              console.log(arguments)
            });
        },
        templateUrl: CmsConfig.buildComponentPath(
          'content-relations',
          'content-relations.html'
        )
      };
    }
  ]);
