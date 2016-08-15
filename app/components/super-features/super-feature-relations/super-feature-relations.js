'use strict';

angular.module('bulbs.cms.superFeatures.relations', [
  'bettyEditable',
  'bulbs.cms.site.config',
  'bulbs.cms.superFeatures.api',
  'statusFilter.config'
])
  .directive('superFeatureRelations', [
    'CmsConfig', 'SuperFeaturesApi', 'StatusFilterOptions',
    function (CmsConfig, SuperFeaturesApi, StatusFilterOptions) {
      return {
        scope: {
          article: '='
        },
        link: function (scope, element, attrs) {
          scope.statuses = StatusFilterOptions.getStatuses()
            .filter(function (status) {
              // remove default status
              return !!status.value;
            });

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
