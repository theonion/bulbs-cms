'use strict';

angular.module('apiServices.section.factory', [
  'apiServices',
  'apiServices.customSearch.count.factory',
  'apiServices.mixins.fieldDisplay'
])
  .factory('Section', function (_, CustomSearchCount, restmod) {
    var sectionEndpoint = 'section';

    return restmod.model(sectionEndpoint).mix('FieldDisplay', 'NestedDirtyModel', {
      $config: {
        name: 'Section',
        plural: 'Sections',
        primaryKey: 'id',
        fieldDisplays: [{
          title: 'Section Name',
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
           * Getter for section content count.
           *
           * @returns {String} section content count.
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
