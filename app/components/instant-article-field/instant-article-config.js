'use strict';

angular.module('cms.instant_article.config', []).factory('InstantArticleConfig', [function () {
  var supportedFeatureTypes = [];

  var factory = {};

  factory.setSupportedFeatureTypes = function(featureTypes) {
    supportedFeatureTypes = featureTypes;

    return this;
  };

  factory.getSupportedFeatureTypes = function() {
    return supportedFeatureTypes;
  };

  return factory;
}]);
