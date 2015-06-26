'use strict';

angular.module('apiServices.reporting.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Reporting', function (_, restmod) {
    var contributionsEndpoint = 'contributions'
    var roleEndpoint = 'contributions/role'

    return restmod.model(roleEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Role',
        plural: 'Roles',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Role',
          value: 'record.name'
        }]
      },
      query: {
        init: {}
      },
      promoted: {
        init: true
      },
      $hooks: {
      }
    });
  });