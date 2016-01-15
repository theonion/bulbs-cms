'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'apiServices.featureTypeRate.factory'
])
  .factory('Role', function (_, restmod) {
    var roleEndpoint = 'contributions/role';
    return restmod.model(roleEndpoint, {
      feature_type_rates: { hasMany: 'FeatureTypeRate'}
    }).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Role',
        plural: 'Roles',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Role',
            value: 'record.name'
          },
          {
            title: 'Payment Type',
            value: 'record.paymentType'
          }
        ]
      },
    });
  });