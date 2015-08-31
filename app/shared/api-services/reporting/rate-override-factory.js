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
      role: {},
      $hooks: {
      }
    });
  });