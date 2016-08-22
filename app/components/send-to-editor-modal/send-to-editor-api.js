'use strict';

angular.module('bulbs.cms.sendToEditorModal.api', [
  'bulbs.cms.dateTimeFilter',
  'bulbs.cms.site.config',
  'bulbs.cms.utils',
  'lodash',
])
  .service('SendToEditorApi', [
    '_', '$http', 'CmsConfig', 'dateTimeFormatFilter', 'moment', 'Utils',
    function (_, $http, CmsConfig, dateTimeFormatFilter, moment, Utils) {

      var endpoint = function (article) {
        return CmsConfig.buildApiUrlRoot('content', article.id, 'send');
      };

      var parsePayload = function (payload) {
        var data = _.cloneDeep(payload.data);
        return data;
      };

      return {
        sendToEditor: function (article, status, notes) {
          return $http.post(
              endpoint(article), {
                status: status,
                notes: notes
              }
            ).then(function (response) {
              return parsePayload(response);
            });
        }
      };
    }
  ]);
