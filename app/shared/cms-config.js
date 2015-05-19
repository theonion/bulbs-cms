'use strict';

angular.module('cms.config', [
  'lodash'
])
  .provider('CmsConfig', function CmsConfigProvider (_) {
    // root for all backend requests
    var backendRoot = '';
    // url for logo to display in CMS
    var logoUrl = '';
    // url for custom toolbar on edit page
    var toolbarMappings = {};

    this.setBackendRoot = function (value) {
      if (_.isString(value)) {
        backendRoot = value;
      } else {
        throw new TypeError('CmsConfig.backendRoot must be a string!');
      }
    };

    this.setLogoUrl = function (value) {
      if (_.isString(value)) {
        logoUrl = value;
      } else {
        throw new TypeError('CmsConfig.logoUrl must be a string!');
      }
    };

    this.setToolbarMappings = function (obj) {
      if (_.isObject(obj)) {
        toolbarMappings = _.clone(obj);
      } else {
        throw new TypeError('CmsConfig.toolbarMappings must be an object!');
      }
    };

    this.$get = function () {
      return {
        getLogoUrl: function () {
          return logoUrl;
        },
        getToolbarMappings: function () {
          return toolbarMappings;
        },
        /**
         * Create an absolute url to the backend for the CMS by using the backendRoot.
         *
         * @param {string} relUrl - relative url to get the absolute url for.
         * @returns absolute url.
         */
        buildBackendUrl: function (relUrl) {
          return backendRoot + relUrl;
        }
     };
    };
  });
