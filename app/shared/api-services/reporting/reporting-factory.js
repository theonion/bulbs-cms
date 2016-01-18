'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'apiServices.featureTypeRate.factory'
])
  .factory('Role', function (_, restmod) {
    var roleEndpoint = 'contributions/role';
    return restmod.model(roleEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      feature_type_rates: {
        hasMany: 'FeatureTypeRate',
        path: 'feature_type_rates',
        params: {},
        hooks: {
          'after-fetch-many': function() {
            var next = this.$metadata.next;
            if (!_.isUndefined(next)) {
              this.$owner.feature_type_rates.$page += 1;
              this.$owner.feature_type_rates.$fetch();
            }
          }
        }
      },
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