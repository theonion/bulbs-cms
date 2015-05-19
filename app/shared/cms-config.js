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

    this.setEditPageMappings = function (obj) {
      if (_.isObject(obj)) {
        editPageMappings = _.clone(obj);
      } else {
        throw new TypeError('CmsConfig.toolbarMappings must be an object!');
      }
    };

    this.$get = function () {
      return {
        getLogoUrl: _.constant(logoUrl),
        getToolbarMappings: _.constant(_.clone(toolbarMappings)),
        getEditPageMappings: _.constant(_.clone(editPageMappings)),
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
