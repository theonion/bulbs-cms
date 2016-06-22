'use strict';

angular.module('cms.instant_article.config', []).provider('InstantArticleConfig', [function InstantArticleConfigProvider () {
  var supportedFeatureTypes = [];

  this.setSupportedFeatureTypes = function(featureTypes) {
    supportedFeatureTypes = featureTypes;

    return this;
  };

  this.$get = function() {
    return {
      // Returns the support feature type names for Instant Articles
      // @param N/A
      // @returns Array of Strings, e.g. ['News in Brief']
      getSupportedFeatureTypes: function() {
        return supportedFeatureTypes;
      }
    }
  };
}]);
