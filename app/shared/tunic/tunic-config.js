'use strict';

angular.module('cms.tunic.config', [
  'lodash'
])
  .provider('TunicConfig', [
    '_',
    function TunicConfigProvider (_) {
      // relative api path, rel to backendRoot
      var apiPath = '';
      // root for all backend requests
      var backendRoot = '';
      // Tunic API request token
      var requestToken = '';

      var error = function (message) {
        return new Error('Configuration Error (TunicConfig) ' + message);
      };

      this.setApiPath = function (value) {
        if (_.isString(value)) {
          apiPath = value;
        } else {
          throw error('apiPath must be a string!');
        }
        return this;
      };

      this.setBackendRoot = function (value) {
        if (_.isString(value)) {
          backendRoot = value;
        } else {
          throw error('backendRoot must be a string!');
        }
        return this;
      };

      this.setRequestToken = function (value) {
        if (_.isString(value)) {
          requestToken = value;
        } else {
          throw error('requestToken must be a string!');
        }
        return this;
      };

      this.$get = function () {
        return {
          getRequestToken: _.constant(requestToken),
          /**
           * Create an absolute api url.
           *
           * @param {string} relUrl - relative url to get the absolute api url for.
           * @returns absolute api url.
           */
          buildBackendApiUrl: function (relUrl) {
            return backendRoot + apiPath + (relUrl || '');
          },

          /**
           * Check if a given url should be intercepted by this library's interceptor.
           *
           * @param {string} url - Url to test against matchers.
           * @returns {boolean} true if url should be intercepted, false otherwise.
           */
          shouldBeIntercepted: function (url) {
            var urlTest = backendRoot + apiPath;
            return urlTest !== '' && url.startsWith(urlTest);
          }
        };
      };
    }
  ]);
