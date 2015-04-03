'use strict';

angular.module('apiServices.campaign.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment'
])
  .factory('Campaign', function (restmod) {
    return restmod.model('campaign').mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Campaign',
        plural: 'Campaigns',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Campaign',
          value: 'record.campaignLabel',
          sorts: 'campaign_label'
        }, {
          title: 'Sponsor',
          value: 'record.sponsorName',
          sorts: 'sponsor_name'
        }, {
          title: 'Start Date',
          value: 'record.startDate.format("MM/DD/YY") || "--"',
          sorts: 'start_date'
        }, {
          title: 'End Date',
          value: 'record.endDate.format("MM/DD/YY") || "--"',
          sorts: 'end_date'
        }]
      },

      pixels: {
        init: [{}],
      },

      // fields from frontend to backend
      end_date: {
        encode: 'moment_to_date_string',
      },
      start_date: {
        encode: 'moment_to_date_string',
      },

      // fields from backend to frontend
      endDate: {
        decode: 'date_string_to_moment',
      },
      startDate: {
        decode: 'date_string_to_moment'
      },

      $extend: {
        Model: {
          simpleSearch: function (searchTerm) {
            return this.$search({search: searchTerm, ordering: 'campaign_label'}).$asPromise();
          }
        }
      }
    });
  });
