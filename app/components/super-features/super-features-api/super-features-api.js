'use strict';

angular.module('bulbs.cms.superFeatures.api', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'lodash',
  'moment'
])
  .service('SuperFeaturesApi', [
    '_', '$http', 'CmsConfig', 'dateTimeFormatFilter', 'moment', 'Utils',
    function (_, $http, CmsConfig, dateTimeFormatFilter, moment, Utils) {

<<<<<<< HEAD
      var endpoint = function (path) {
        return CmsConfig.buildApiUrlRoot('super-feature', path);
      };

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);
=======
      var superFeatureEndpoint = function (path) {
        return CmsConfig.buildApiUrlRoot('super-feature', path);
      };

      var contentEndpoint = function (path) {
        return CmsConfig.buildApiUrlRoot('content', path);
      };

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);

        if (payload.published) {
          data.published = moment.tz(payload.published, CmsConfig.getTimezoneName());
        }

>>>>>>> master
        return data;
      };

      var cleanData = function (data) {
        var payload = _.cloneDeep(data);
<<<<<<< HEAD
=======

        if (data.published) {
          payload.published = payload.published.format();
        }

>>>>>>> master
        return payload;
      };

      return {
        createSuperFeature: function (data) {
          var payload = cleanData(data);
<<<<<<< HEAD
          return $http.post(endpoint(), payload).then(function (response) {
            return parsePayload(response.data);
          });
        },
        deleteSuperFeature: function (data) {
          return $http.delete(endpoint(data.id));
=======
          return $http.post(
              contentEndpoint() +
                Utils.param({ doctype: CmsConfig.getSuperFeaturesType() }),
              payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        deleteSuperFeature: function (data) {
          return $http.delete(contentEndpoint(data.id));
>>>>>>> master
        },
        fields: [{
          title: 'Super Feature Name',
          sorts: 'title'
        }, {
          title: 'Total Nested Pages',
          content: 'children_count'
        }, {
          title: 'Publish Date',
          content: function (superFeature) {
            var now = moment();
            var cellContent = '';

            if (!superFeature.published) {
              cellContent = 'Draft';
            } else if (now.isSameOrAfter(superFeature.published)) {
              cellContent = dateTimeFormatFilter(superFeature.published);
            } else if (now.isBefore(superFeature.published)) {
<<<<<<< HEAD
              cellContent = dateTimeFormatFilter(superFeature.published, '[Scheduled for] M/D/YY h:mma z');
=======
              cellContent = dateTimeFormatFilter(
                superFeature.published,
                '[Scheduled for] M/D/YY h:mma z'
              );
>>>>>>> master
            }

            return cellContent;
          }
        }],
        getSuperFeature: function (id) {
<<<<<<< HEAD
          return $http.get(endpoint(id)).then(function (response) {
=======
          return $http.get(superFeatureEndpoint(id)).then(function (response) {
>>>>>>> master
            return parsePayload(response.data);
          });
        },
        getSuperFeatures: function (params) {
<<<<<<< HEAD
          return $http.get(endpoint(Utils.param(params)))
=======
          return $http.get(superFeatureEndpoint(Utils.param(params)))
>>>>>>> master
            .then(function (response) {
              return {
                results: response.data.results.map(function (result) {
                  return parsePayload(result);
                })
              };
            });
        },
<<<<<<< HEAD
        name: 'Super Feature',
        namePlural: 'Super Features',
        updateSuperFeature: function (data) {
          return $http.put(endpoint(data.id)).then(function (response) {
            return parsePayload(response.data);
          });
=======
        getSuperFeatureRelations: function (id) {
          return $http.get(superFeatureEndpoint(Utils.path.join(id, 'relations')))
            .then(function (response) {
              return {
                results: response.data.map(function (result) {
                  return parsePayload(result);
                })
              };
            });
        },
        name: 'Super Feature',
        namePlural: 'Super Features',
        updateSuperFeature: function (data) {
          return $http.put(contentEndpoint(data.id), data)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        updateSuperFeatureRelationsOrdering: function (id, relations) {
          var remappedRelations = relations.map(function (relation) {
            return _.pick(relation, 'id', 'ordering');
          });
          return $http.put(
            superFeatureEndpoint(Utils.path.join(id, 'relations', 'ordering')),
            remappedRelations
          );
        },
        updateAllRelationPublishDates: function (id) {
          return $http.put(superFeatureEndpoint(Utils.path.join(id, 'set-children-dates')));
>>>>>>> master
        }
      };
    }
  ]);
