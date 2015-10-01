'use strict';

angular.module('apiServices.rateOverride.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('RateOverride', function (_, restmod) {
    var rateOverrideEndpoint = 'contributions/rate-overrides';

    return restmod.model(rateOverrideEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Rate Override',
        plural: 'Rate Overrides',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Name',
            value: 'record.contributor.fullName'
          },
          {
            title: 'Role',
            value: 'record.role.name'
          }
        ]
      },
      role: {
        init: {}
      },
      $hooks: {
        'before-save': function(_req) {
          var featureTypes = _req.data.feature_types;
          if (featureTypes.length > 0) {
            for (var key in featureTypes) {
              var obj = featureTypes[key];
              if (obj.hasOwnProperty('featureType')) {
                if (obj.featureType.hasOwnProperty('name')) {
                  _req.data.feature_types[key].feature_type = obj.featureType.name;
                } else if (obj.featureType.hasOwnProperty('value')) {
                  _req.data.feature_types[key].feature_type.slug = obj.featureType.value;
                }
              }
            }
          }
        },
        'before-render': function(record) {
          if (record.hasOwnProperty('feature_types')) {
            for (var key in record.feature_types) {
              if (record.feature_types[key].hasOwnProperty('feature_type')){
                if (record.feature_types[key].feature_type.hasOwnProperty('name')) {
                  record.feature_types[key].feature_type = record.feature_types[key].feature_type.name;
                }
              }
            }
          }
        }
      }
    });
  });