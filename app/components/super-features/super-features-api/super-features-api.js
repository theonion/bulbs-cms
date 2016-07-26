'use strict';

angular.module('bulbs.cms.superFeatures.api', [
  'bulbs.cms.site.config',
  'lodash'
])
  .service('SuperFeaturesApi', [
    '_', '$http', 'CmsConfig',
    function (_, $http, CmsConfig) {
      var endpoint = CmsConfig.buildSuperFeaturesApiUrl;

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
          return $http.post(endpoint(), payload).then(function (response) {
            return parsePayload(response.data);
          });
        },
        deleteSuperFeature: function (data) {
          return $http.delete(endpoint(data.id));
        },
        fields: [{
          title: 'Super Feature Name',
          sorts: 'title'
        }, {
          title: 'Sponsor',
          content: function (superFeature) {
            // TODO : fill this in
          }
        }, {
          title: 'Total Nested Pages'
        }, {
          title: 'Publish Date',
          content: function (superFeature) {
            // TODO : fill this in
          }
        }],
        getSuperFeature: function (id) {
          return $http.get(endpoint(id)).then(function (response) {
            return parsePayload(response.data);
          });
        },
        getSuperFeatures: function () {
          return $http.get(endpoint()).then(function (response) {
            return {
              results: response.data.results.map(function (result) {
                return parsePayload(result);
              })
            };
          });
        },
        name: 'Super Feature',
        namePlural: 'Super Features',
        updateSuperFeature: function (data) {
          return $http.put(endpoint(data.id)).then(function (response) {
            return parsePayload(response.data);
          });
        }
      };
    }
  ]);
