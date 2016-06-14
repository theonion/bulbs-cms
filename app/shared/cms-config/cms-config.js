'use strict';

angular.module('bulbs.cms.config', [
  'bulbs.cms.utils',
  'lodash'
])
  .provider('CmsConfig', [
    '_', 'UtilsProvider',
    function (_, Utils) {

      var error = BulbsCmsConfigError.build('CmsConfig');
      var check = function (value, test, errorMsg) {
        if (test(value)) {
          return value;
        } else {
          throw new error(errorMsg);
        }
      };

      var imageUrl = '';
      var imageApiKey = '';

      this.images = {
        setApiUrl: function (value) {
          imageUrl = check(
            value, _.isString,
            'image api url must be a string!'
          );
          window.BC_ADMIN_URL = imageUrl;
          return this;
        },
        setApiKey: function (value) {
          imageApiKey = check(
            value, _.isString,
            'image api key must be a string!'
          );
          window.BC_API_KEY = imageApiKey;
          return this;
        }
      };

      this.$get = [
        function () {
          return {
            images: {
              getApiUrl: _.constant(imageUrl),
              getApiKey: _.constant(imageApiKey)
            }
          };
        }
      ];

      return this;
    }
  ]);
