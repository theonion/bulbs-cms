'use strict';

angular.module('bulbs.cms.currentUser.api', [
  'bulbs.cms.site.config',
  'lodash'
])
  .service('CurrentUserApi', [
    '_', '$http', '$q', 'CmsConfig',
    function (_, $http, $q, CmsConfig) {

      var currentUser;
      var pendingGetCurrentUserRequest;

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload);

        data.displayName =
          data.first_name && data.last_name ?
            (data.first_name + ' ' + data.last_name) :
            (data.email || data.username);

        return data;
      };

      var getCurrentUser = function () {
        if (!pendingGetCurrentUserRequest) {
          pendingGetCurrentUserRequest = $http.get(CmsConfig.buildApiUrlRoot('me/'))
            .then(function (response) {
              currentUser = parsePayload(response.data);
              return currentUser;
            })
            .finally(function () {
              pendingGetCurrentUserRequest = null;
            });
        }

        return pendingGetCurrentUserRequest;
      };

      return {
        getCurrentUserWithCache: function () {
          if (currentUser) {
            return $q.when(currentUser);
          }
          return getCurrentUser();
        },
        logout: function () {
          return $http.get(CmsConfig.buildApiUrlRoot('me', 'logout/'))
            .then(function () {
              currentUser = null;
            });
        }
      };
    }]
  );
