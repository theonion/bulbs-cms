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

      return {
        getLiveBlogEntries: function (id) {
          var params;
          if (id) {
            params = Utils.param({ liveblog: id });
          }

          return $http.get(liveBlogEndpoint('entry', params))
            .then(function (response) {
              return response.data.results.map(function (result) {
                return parsePayload(result);
              });
            });
        }
      };
    }
  ]);
