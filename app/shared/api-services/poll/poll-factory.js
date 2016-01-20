'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment'
])
  .factory('Poll', function (restmod) {
    return restmod.model('poll').mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Poll',
        plural: 'Polls',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Poll Name',
          value: 'record.title',
          sorts: 'title'
        }, {
          title: 'Creator',
          value: 'record.creator',
          sorts: 'creator'
        }, {
          title: 'Publish Date',
          value: 'record.publishDate.format("MM/DD/YY") || "--"',
          sorts: 'publish_date'
        }, {
          title: 'Close Date',
          value: 'record.closeDate.format("MM/DD/YY") || "--"',
          sorts: 'close_date'
        }]
      },

      pixels: {
        init: [{}],
      },

      // fields from frontend to backend
      close_date: {
        encode: 'moment_to_date_string',
      },
      publish_date: {
        encode: 'moment_to_date_string',
      },

      // fields from backend to frontend
      closeDate: {
        decode: 'date_string_to_moment',
      },
      publishDate: {
        decode: 'date_string_to_moment'
      },

      $extend: {
        Model: {
          simpleSearch: function (searchTerm) {
            return this.$search({search: searchTerm, ordering: 'title'}).$asPromise();
          }
        }
      }
    });
  });
