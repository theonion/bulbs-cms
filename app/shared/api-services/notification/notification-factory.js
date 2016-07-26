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
          title: 'Notification Name',
          value: 'record.name',
          sorts: 'name'
        }, {
          title: 'Article Count',
          value: 'record.$resultCount'
        }]
      },
      query: {
        init: {}
      },
      promoted: {
        init: true
      },
      $hooks: {
        'after-fetch': function () {
          this.$refreshResultCount();
        },
        'after-fetch-many': function () {
          _.each(this, function (record) {
            record.$refreshResultCount();
          });
        }
      },
      $extend: {
        Record: {
          /**
           * Getter for notification content count.
           *
           * @returns {String} notification content count.
           */
          $refreshResultCount: function () {
            var record = this;
            return CustomSearchCount.$retrieveResultCount(this.query)
              .then(function (count) {
                record.$resultCount = count;
              });
          }
        }
      },
    });
  });
