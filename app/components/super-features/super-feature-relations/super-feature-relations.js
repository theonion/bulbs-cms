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
          SuperFeaturesApi.getSuperFeatureRelations(scope.article.id)
            .then(function (response) {
              scope.relations = response.data.results;
            });
        },
        templateUrl: CmsConfig.buildComponentPath(
          'super-features',
          'super-feature-relations',
          'super-feature-relations.html'
        )
      };
    }
  ]);
