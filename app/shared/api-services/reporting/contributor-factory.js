'use strict';

angular.module('apiServices.contributor.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Contributor', function (_, restmod) {
    var contributorEndpoint = 'contributions/staff';

    return restmod.model(contributorEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Contributor',
        plural: 'Contributors',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Name',
            value: 'record.fullName'
          }
        ]
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