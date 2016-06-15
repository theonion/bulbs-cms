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

      var cacheBuster = '';
      var componentPath = '';
      var cmsName = '';
      var imageApiUrl = '';
      var imageApiKey = '';

      this.setCacheBuster = function (value) {
        cacheBuster = check(
          value, _.isString,
          'cache buster must be a string!'
        );
        return this;
      };

      this.setComponentPath = function (value) {
        componentPath = check(
          value, _.isString,
          'component path must be a string!'
        );
        return this;
      };

      this.setCmsName = function (value) {
        cmsName = check(
          value, _.isString,
          'cms name must be a string!'
        );
        return this;
      }

      this.setImageApiUrl = function (value) {
        imageApiUrl = check(
          value, _.isString,
          'image api url must be a string!'
        );
        window.BC_ADMIN_URL = imageApiUrl;
        return this;
      };

      this.setImageApiKey = function (value) {
        imageApiKey = check(
          value, _.isString,
          'image api key must be a string!'
        );
        window.BC_API_KEY = imageApiKey;
        return this;
      };

      this.$get = [
        function () {
          return {
            getCacheBuster: _.constant(cacheBuster),
            getCmsName: _.constant(cmsName),
            getImageApiKey: _.constant(imageApiKey),
            buildComponentPath: function () {
              return Utils.path.join(arguments);
            }.bind(this, componentPath),
            buildImageApiUrl: function () {
              return Utils.path.join(arguments);
            }.bind(this, imageApiUrl)
          };
        }
      ];

      return this;
    }
  ]);
