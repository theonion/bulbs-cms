'use strict';

angular.module('cms.config', [])
  .provider('CmsConfig', function CmsConfigProvider () {
    // root for all backend requests
    var backendRoot = '';
    // url for logo to display in CMS
    var logoUrl = '';

    this.setBackendRoot = function (value) {
      if (typeof(value) === 'string') {
        backendRoot = value;
      } else {
        throw new TypeError('CmsConfig.backendRoot must be a string!');
      }
    };

    this.setLogoUrl = function (value) {
      if (typeof(value) === 'string') {
        logoUrl = value;
      } else {
        throw new TypeError('CmsConfig.logoUrl must be a string!');
      }
    };

    this.$get = function () {
      return {
        /**
         * Create an absolute url to the backend for the CMS by using the backendRoot.
         *
         * @param {string} relUrl - relative url to get the absolute url for.
         * @returns absolute url.
         */
        buildBackendUrl: function (relUrl) {
          return backendRoot + relUrl;
        },
        getLogoUrl: function () {
          return logoUrl;
        }
     };
    };
  });
