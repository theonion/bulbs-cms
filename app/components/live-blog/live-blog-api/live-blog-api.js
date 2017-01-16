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
      var liveBlogEntryResponseEndpoint = function (entryId) {
        return liveBlogEntryEndpoint.bind(null, entryId, 'responses');
      };

      var parseEntryPayload = function (payload) {
        var data = _.chain(payload)
          .cloneDeep()
          .mapKeys(function (value, key) {
            return Utils.toCamelCase(key);
          })
          .value();

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

      var cleanEntryData = function (data) {
        var payload = _.chain(data)
          .omit('published')
          .cloneDeep()
          .mapKeys(function (value, key) {
            return Utils.toSnakeCase(key);
          })
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

      var parseEntryResponsePayload = function (payload) {
        var data = _.chain(payload)
          .cloneDeep()
          .mapValues(function (value, key) {

            if (_.includes(['created', 'last_modified'], key)) {
              return moment.tz(value, CmsConfig.getTimezoneName());
            }

            return value;
          })
          .mapKeys(function (value, key) {
            return Utils.toCamelCase(key);
          })
          .value();

        return data;
      };

      var cleanEntryResponseData = function (data) {
        var payload = _.chain(data)
          .mapValues(function (value) {

            if (moment.isMoment(value)) {
              return value.format();
            }

            return value;
          })
          .cloneDeep()
          .mapKeys(function (value, key) {
            return Utils.toSnakeCase(key);
          })
          .value();

        return payload;
      };

      return {
        createEntry: function (data) {
          var payload = cleanEntryData(data);
          return $http.post(liveBlogEntryEndpoint('/'), payload)
            .then(function (response) {
              return parseEntryPayload(response.data);
            });
        },
        updateEntry: function (entry) {
          var payload = cleanEntryData(entry);
          return $http.put(liveBlogEntryEndpoint(payload.id, '/'), payload)
            .then(function (response) {
              return parseEntryPayload(response.data);
            });
        },
        deleteEntry: function (entry) {
          return $http.delete(liveBlogEntryEndpoint(entry.id, '/'));
        },
        getEntries: function (parentId) {
          var params;
          if (parentId) {
            params = Utils.param({ liveblog: parentId });
          }

          return $http.get(liveBlogEntryEndpoint('/', params))
            .then(function (response) {
              return {
                results: response.data.results.map(function (result) {
                  return parseEntryPayload(result);
                })
              };
            });
        },
        createEntryResponse: function (entry, data) {
          var payload = cleanEntryResponseData(data);

          return $http.post(liveBlogEntryResponseEndpoint(entry.id)('/'), payload)
            .then(function (response) {
              return parseEntryResponsePayload(response.data);
            });
        },
        updateEntryResponse: function (entryResponse) {
          var payload = cleanEntryResponseData(entryResponse);

          return $http.put(liveBlogEntryResponseEndpoint(entryResponse.entry)(entryResponse.id, '/'), payload)
            .then(function (response) {
              return parseEntryResponsePayload(response.data);
            });
        },
        deleteEntryResponse: function (entryResponse) {

          return $http.delete(liveBlogEntryResponseEndpoint(entryResponse.entry)(entryResponse.id, '/'));
        },
        getEntryResponses: function (entryId) {

         return $http.get(liveBlogEntryResponseEndpoint(entryId)('/'))
           .then(function (response) {
             return {
               results: response.data.results.map(function (result) {
                 return parseEntryResponsePayload(result);
               })
             };
           });
        }
      };
    }
  ]);

