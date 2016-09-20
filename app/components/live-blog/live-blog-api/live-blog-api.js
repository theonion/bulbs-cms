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
      var liveBlogEntryEndpoint = liveBlogEndpoint.bind(null, 'entry');

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);

        if (payload.published) {
          data.published = moment.tz(payload.published, CmsConfig.getTimezoneName());
        }

        if (payload.created) {
          data.created = moment.tz(payload.created, CmsConfig.getTimezoneName());
        }

        if (payload.updated) {
          data.updated = moment.tz(payload.updated, CmsConfig.getTimezoneName());
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

        if (data.created) {
          payload.created = data.created.format();
        }

        if (data.updated) {
          payload.updated = data.updated.format();
        }

        return payload;
      };

      return {
        createEntry: function (data) {
          var payload = cleanData(data);
          return $http.post(liveBlogEntryEndpoint('/'), payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        updateEntry: function (entry) {
          var payload = cleanData(entry);
          return $http.put(liveBlogEntryEndpoint(payload.id, '/'), payload)
            .then(function (response) {
              return parsePayload(response.data);
            });
        },
        deleteEntry: function (entry) {
          return $http.delete(liveBlogEntryEndpoint(entry.id, '/'));
        },
        getEntries: function (id) {
          var params;
          if (id) {
            params = Utils.param({ liveblog: id });
          }

          return $http.get(liveBlogEntryEndpoint('/', params))
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
