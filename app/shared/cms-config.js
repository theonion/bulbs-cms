'use strict';

angular.module('cms.config', [
  'lodash'
])
  .provider('CmsConfig', function CmsConfigProvider (_) {
    // root for all backend requests
    var backendRoot = '';
    // create content modal template to use
    var createContentTemplateUrl = '';
    // url for logo to display in CMS
    var logoUrl = '';
    // mappings where pairs are <name>: <template-url> for looking up toolbar templates
    var toolbarMappings = {};
    // mappings where pairs are <polymorphic_ctype>: <template-url> for looking up edit page templates
    var editPageMappings = {};
    // callback to fire when user is attempting to logout
    var logoutCallback = function () {};

    var error = function (message) {
      return new ConfigError('CmsConfig', message);
    };

    var getOrFail = function (obj, key, failureMessage) {
      if (key in obj) {
        return obj[key];
      }
      throw error(failureMessage || 'Unable to find mapping.');
    };

    this.setBackendRoot = function (value) {
      if (_.isString(value)) {
        backendRoot = value;
      } else {
        throw error('backendRoot must be a string!');
      }
    };

    this.setCreateContentTemplateUrl = function (value) {
      if (_.isString(value)) {
        createContentTemplateUrl = value;
      } else {
        throw error('createContentTemplateUrl must be a string!');
      }
    };

    this.setLogoUrl = function (value) {
      if (_.isString(value)) {
        logoUrl = value;
      } else {
        throw error('logoUrl must be a string!');
      }
    };

    this.setToolbarMappings = function (obj) {
      if (_.isObject(obj)) {
        toolbarMappings = _.clone(obj);
      } else {
        throw error('toolbarMappings must be an object!');
      }
    };

    this.setEditPageMappings = function (obj) {
      if (_.isObject(obj)) {
        editPageMappings = _.clone(obj);
      } else {
        throw error('editPageMappings must be an object!');
      }
    };

    this.setLogoutCallback = function (func) {
      if (_.isFunction(func)) {
        logoutCallback = func;
      } else {
        throw error('logoutCallback must be a function!');
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
        getCreateContentTemplateUrl: _.constant(createContentTemplateUrl),
        logoutCallback: logoutCallback,
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
