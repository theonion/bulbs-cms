'use strict';

angular.module('bulbs.cms.config', [
  'bulbs.cms.utils',
  'lodash'
])
  .provider('CmsConfig', [
    '_', 'UtilsProvider',
    function (_, Utils) {

      var error = BulbsCmsConfigError.build('CmsConfig');
      var checkOrError = function (value, test, errorMsg) {
        if (test(value)) {
          return value;
        } else {
          throw new error(errorMsg);
        }
      };
      var pathBuilder = function (start, errorMsg) {
        return function () {
          return Utils.path.join(checkOrError(
            arguments,
            function (args) {
              return _.every(args, _.isString);
            },
            errorMsg
          ));
        }.bind(null, start);
      };

      var cacheBuster = '';
      var componentPath = '';
      var cmsName = '';
      var imageApiUrl = '';
      var imageApiKey = '';

      this.setCacheBuster = function (value) {
        cacheBuster = checkOrError(
          value, _.isString,
          'cache buster must be a string!'
        );
        return this;
      };

      this.setComponentPath = function (value) {
        componentPath = checkOrError(
          value, _.isString,
          'component path must be a string!'
        );
        return this;
      };

      this.setCmsName = function (value) {
        cmsName = checkOrError(
          value, _.isString,
          'cms name must be a string!'
        );
        return this;
      }

      this.setImageApiUrl = function (value) {
        imageApiUrl = checkOrError(
          value, _.isString,
          'image api url must be a string!'
        );
        window.BC_ADMIN_URL = imageApiUrl;
        return this;
      };

      this.setImageApiKey = function (value) {
        imageApiKey = checkOrError(
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
            buildComponentPath: pathBuilder(
              componentPath,
              'value given to component path build must be a string!'
            ),
            buildImageApiUrl: pathBuilder(
              imageApiUrl,
              'value given to image api url build must be a string!'
            )
          };
        }
      ];

      return this;
    }
  ]);
