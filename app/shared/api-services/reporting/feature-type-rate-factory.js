'use strict';

angular.module('apiServices.featureTypeRate.factory', [
  'apiServices',
  'apiServices.reporting.factory',
  'apiServices.mixins.fieldDisplay'
])
  .factory('FeatureTypeRate', function (_, restmod) {
    return restmod.model('feature_type_rates', {}).mix('NestedDirtyModel');
  });