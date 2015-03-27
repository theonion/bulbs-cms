'use strict';

angular.module('apiServices.section.factory', [
  'apiServices',
  'apiServices.customSearch.count.factory'
])
  .factory('Section', function (_, CustomSearchCount, restmod) {
    var sectionEndpoint = 'section';

    return restmod.model(sectionEndpoint).mix('NestedDirtyModel', {
      $config: {
        name: 'Section',
        plural: 'Sections',
        primaryKey: 'id'
      },
      query: {
        init: {}
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
