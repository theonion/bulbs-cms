'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Role', function (_, restmod) {
    // var contributionsEndpoint = 'contributions';
    var roleEndpoint = 'contributions/role';

    return restmod.model(roleEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
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
      rates: {
        init: {
          featureType: []
        }
      }
    });
  });