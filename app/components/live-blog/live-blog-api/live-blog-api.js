'use strict';

angular.module('bulbs.cms.liveBlog.api', [
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'lodash',
  'moment'
])
  .service('LiveBlogApi', [
    '_', '$http', 'CmsConfig', 'moment', 'Utils',
    function (_, $http, CmsConfig, moment, Utils) {

      var liveBlogEndpoint = CmsConfig.buildApiUrlRoot.bind(null, 'liveblog');

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);

        if (data.published) {
          data.published = moment.tz(payload.published, CmsConfig.getTimezoneName());
        }

        return data;
      };

      var cleanData = function (data) {
        var payload = _.chain(data)
          .omit('published')
          .cloneDeep()
          .value();

        if (data.published) {
          payload.published = data.published.format();
        }

        return payload;
      };

      return {
        createEntry: function (entry) {
          var payload = cleanData(entry);
          return $http.post(liveBlogEndpoint('entry'), payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        updateEntry: function (entry) {
          var payload = cleanData(entry);
          return $http.put(liveBlogEndpoint('entry', payload.id), payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        deleteEntry: function (entry) {
          return $http.delete(liveBlogEndpoint('entry', entry.id));
        },
        getEntries: function (id) {
          var params;
          if (id) {
            params = Utils.param({ liveblog: id });
          }

          return $http.get(liveBlogEndpoint('entry', params))
            .then(function (response) {
              return {
                results: response.data.results.map(function (result) {
                  return parsePayload(result);
                })
              };
            });
        }
      };
    }
  ]);
