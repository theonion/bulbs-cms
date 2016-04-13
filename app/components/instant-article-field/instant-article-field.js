'use strict';

angular.module('instantArticleField', ['bulbsCmsApp.settings', 'cms.instant_article.config', 'lodash'])
  .directive('instantArticleField', ['routes', '_', 'InstantArticleConfig', function(routes, _, InstantArticleConfig) {
    return {
      templateUrl: routes.COMPONENTS_URL + 'instant-article-field/instant-article-field.html',
      restrict: 'E',
      scope: {
        content: '='
      },
      link: function(scope, element, attrs) {
        scope.setActive = function() {
          scope.content.instant_article = true;
        };

        scope.setInactive = function() {
          scope.content.instant_article = false;
        };

        scope.instantArticleEnabled = _.includes(InstantArticleConfig.getSupportedFeatureTypes(), scope.content.feature_type);
      }
    };
  }]);
