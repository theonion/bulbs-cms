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

      var superFeatureEndpoint = function (path) {
        return CmsConfig.buildApiUrlRoot('super-feature', path);
      };

      var contentEndpoint = function (path) {
        return CmsConfig.buildApiUrlRoot('content', path);
      };

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);
        return data;
      };

      var cleanData = function (data) {
        var payload = _.cloneDeep(data);
        return payload;
      };

      return {
        createSuperFeature: function (data) {
          var payload = cleanData(data);
          return $http.post(contentEndpoint(), payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        deleteSuperFeature: function (data) {
          return $http.delete(contentEndpoint(data.id));
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
              cellContent = dateTimeFormatFilter(
                superFeature.published,
                '[Scheduled for] M/D/YY h:mma z'
              );
            }

            return cellContent;
          }
        }],
        getSuperFeature: function (id) {
          return $http.get(superFeatureEndpoint(id)).then(function (response) {
            return parsePayload(response.data);
          });
        },
        getSuperFeatures: function (params) {
          return $http.get(superFeatureEndpoint(Utils.param(params)))
            .then(function (response) {
              return {
                results: response.data.results.map(function (result) {
                  return parsePayload(result);
                })
              };
            });
        },
        getSuperFeatureRelations: function (id) {
          return $http.get(superFeatureEndpoint(Utils.path.join(id, 'relations')));
        },
        name: 'Super Feature',
        namePlural: 'Super Features',
        updateSuperFeature: function (data) {
          return $http.put(contentEndpoint(data.id))
            .then(function (response) {
              return parsePayload(response.data);
            });
        }
      };
    }
  ]);
