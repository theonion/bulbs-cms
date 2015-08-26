'use strict';

angular.module('apiServices.lineItem.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay'
])
  .factory('LineItem', function (_, restmod) {
    var contributorEndpoint = 'contributions/line-items';

    return restmod.model(contributorEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Line Item',
        plural: 'Line Items',
        primaryKey: 'id',
        fieldDisplays: [
          {
            title: 'Contributor',
            value: 'record.contributor.fullName'
          },
          {
            title: 'Amount $',
            value: 'record.amount'
          },
          {
            title: 'Note',
            value: 'record.note'
          },
          {
            title: 'Date',
            value: 'record.date.format("MM/DD/YY") || "--"'
          }
        ]
      },

      date: {
        decode: 'date_string_to_moment',
        encode: 'moment_to_date_string'
      }

    });
  });