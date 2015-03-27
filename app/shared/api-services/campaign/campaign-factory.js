'use strict';

angular.module('apiServices.campaign.factory', [
  'apiServices',
  'moment'
])
  .filter('date_string_to_moment', function(moment) {
    return function (dateStr) {
      // Try to parse non-empty strings
      if (dateStr && dateStr.length) {
        var m = moment(dateStr);
        if (m.isValid()) {
          return m;
        }
      }
      return null;
    };
  })
  .filter('moment_to_date_string', function(moment) {
    return function (momentObj) {
      if (moment.isMoment(momentObj) && momentObj.isValid()) {
        return momentObj.format();
      } else {
        // Blank time string == not set
        return '';
      }
    };
  })
  .factory('Campaign', function (restmod) {
    return restmod.model('campaign').mix('NestedDirtyModel', {
      $config: {
        name: 'Campaign',
        primaryKey: 'id'
      },

      pixels: {
        init: [],
      },

      end_date: {
        encode: 'moment_to_date_string',
      },
      start_date: {
        encode: 'moment_to_date_string',
      },

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
