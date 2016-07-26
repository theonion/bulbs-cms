'use strict';

angular.module('apiServices.notification.factory', [
  'apiServices',
  'apiServices.customSearch.count.factory',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Notification', function (_, CustomSearchCount, restmod) {
    var notificationEndpoint = 'notification';

    return restmod.model(notificationEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Notification',
        plural: 'Notifications',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Internal Name',
          value: 'record.internalTitle || "--"',
          sorts: 'internal_title'
        }, {
          title: 'State',
          value: 'record.isPublished ? "Published" : "Unpublished"',
          sorts: 'is_published'
        }, {
          title: 'Created On',
          value: 'record.createdOn.format("MM/DD/YYYY")',
          sorts: 'created_on'
        }]
      },

      // fields from frontend to backend
      created_on: {
        encode: 'moment_to_date_string',
      },

      // fields from backend to frontend
      createdOn: {
        decode: 'date_string_to_moment'
      }

    });
  });
