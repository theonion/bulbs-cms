'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Role', function (_, restmod) {
    var roleEndpoint = 'contributions/role';
    return restmod.model(roleEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      flat_rates: {
        hasMany: restmod.model(null, {}).mix('NestedDirtyModel'),
        path: 'flat_rates',
        params: {},
        hooks: {
          'after-fetch-many': function() {
            if (this.length > 0) {
              this.$owner.flat_rate = this[0];
            } else {
              this.$owner.flat_rate = this.$owner.flat_rates.$create({ rate: 0 });
            }
          }
        }
      },
      hourly_rates: {
        hasMany: restmod.model(null, {rate: 0}).mix('NestedDirtyModel'),
        path: 'hourly_rates',
        params: {},
        hooks: {
          'after-fetch-many': function() {
            if (this.length > 0) {
              this.$owner.hourly_rate = this[0];
            } else {
              this.$owner.hourly_rate = this.$owner.hourly_rates.$create({ rate: 0 });
            }
          }
        }
      },
      feature_type_rates: {
        hasMany: restmod.model(null, {}).mix('NestedDirtyModel'),
        path: 'feature_type_rates',
        params: {},
        hooks: {
          'after-fetch-many': function() {
            var next = this.$metadata.next;
            if (!_.isUndefined(next) && next !== null) {
              this.$owner.feature_type_rates.$page++;
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