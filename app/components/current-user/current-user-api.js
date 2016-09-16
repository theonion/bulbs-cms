'use strict';

angular.module('bulbs.cms.currentUser.api', [
  'bulbs.cms.site.config',
  'lodash'
])
  .service('CurrentUserApi', [
    '_', '$http', 'CmsConfig',
    function (_, $http, CmsConfig) {

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);

        data.displayName =
          data.first_name && data.last_name ?
            (data.first_name + ' ' + data.last_name) :
            (data.email || data.username);

        return data;
      };

      return {
        getCurrentUser: function () {
          return $http.get(CmsConfig.buildApiUrlRoot('me/'))
            .then(function (response) {
              return parsePayload(response.data);
            });
        }
      };
    }]
  );
