'use strict';

angular.module('bulbs.cms.superFeatures.relations', [
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api'
])
  .directive('superFeatureRelations', [
    'CmsConfig', 'SuperFeaturesApi',
    function (CmsConfig, SuperFeaturesApi) {
      return {
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {
          // TODO :
          //    2. render relations

          SuperFeaturesApi.getSuperFeatureRelations(scope.article.id)
            .then(function () {
              console.log(arguments);
            });
        },
        templateUrl: CmsConfig.buildComponentPath(
          'content-relations',
          'content-relations.html'
        )
      };
    }
  ]);
