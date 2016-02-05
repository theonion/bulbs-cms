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
          value: 'record.authors.join(", ")',
          sorts: 'author'
        }, {
          title: 'Publish Date',
          value: 'record.publishDate.format("MM/DD/YY") || "--"',
          sorts: 'publish_date'
        }, {
          title: 'Close Date',
          value: 'record.endDate.format("MM/DD/YY") || "--"',
          sorts: 'end_date'
        }]
      },

      // fields from frontend to backend
      end_date: {
        encode: 'moment_to_date_string',
      },
      publish_date: {
        encode: 'moment_to_date_string',
      },

      // fields from backend to frontend
      endDate: {
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
