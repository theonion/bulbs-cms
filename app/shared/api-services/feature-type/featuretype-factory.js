'use strict';

angular.module('apiServices.featureType.factory', [
  'apiServices'
])
  .factory('FeatureType', [
    'restmod',
    function (restmod) {
      return restmod.model('things').mix('NestedDirtyModel', {
        $config: {
          name: 'FeatureType',
          plural: 'FeatureTypes',
          primaryKey: 'id',
        },

        $extend: {
          Model: {
            simpleSearch: function (searchTerm) {
              return this.$search({type: 'feature_type', q: searchTerm}).$asPromise();
            }
          }
        }
      });
    }]
  );