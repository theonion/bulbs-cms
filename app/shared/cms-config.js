'use strict';

angular.module('cms.config', [
  'lodash'
])
  .provider('CmsConfig', function CmsConfigProvider (_) {
    // root for all backend requests
    var backendRoot = '';
    // url for logo to display in CMS
    var logoUrl = '';
    // mappings where pairs are <name>: <template-url> for looking up toolbar templates
    var toolbarMappings = {};
    // mappings where pairs are <polymorphic_ctype>: <template-url> for looking up edit page templates
    var editPageMappings = {};

    var ConfigError = function (message) {
      this.name = 'CmsConfigProvider Configuration Error';
      this.message = message || 'Something was misconfigured.';
    };
    ConfigError.prototype = Object.create(Error.prototype);
    ConfigError.prototype.constructor = ConfigError;

    var getOrFail = function (obj, key, failureMessage) {
      if (key in obj) {
        return obj[key];
      }
      throw new ConfigError(failureMessage || 'Unable to find mapping.');
    };

    this.setBackendRoot = function (value) {
      if (_.isString(value)) {
        backendRoot = value;
      } else {
        throw new ConfigError('backendRoot must be a string!');
      }
    };

    this.setLogoUrl = function (value) {
      if (_.isString(value)) {
        logoUrl = value;
      } else {
        throw new ConfigError('logoUrl must be a string!');
      }
    };

    this.setToolbarMappings = function (obj) {
      if (_.isObject(obj)) {
        toolbarMappings = _.clone(obj);
      } else {
        throw new ConfigError('toolbarMappings must be an object!');
      }
    };

    this.setEditPageMappings = function (obj) {
      if (_.isObject(obj)) {
        editPageMappings = _.clone(obj);
      } else {
        throw new ConfigError('toolbarMappings must be an object!');
      }
    };

    this.$get = function () {
      return {
        getLogoUrl: _.constant(logoUrl),
        getToolbarTemplateUrl: function (type) {
          return getOrFail(toolbarMappings, type, 'Unable to find toolbar template for type "' + type + '"');
        },
        getEditPageTemplateUrl: function (type) {
          return getOrFail(editPageMappings, type, 'Unable to find edit page template for type "' + type + '"');
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
