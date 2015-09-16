'use strict';

angular.module('cms.config', [
  'lodash'
])
  .provider('CmsConfig', function CmsConfigProvider (_) {
    // relative api path, rel to backendRoot
    var apiPath = '';
    // root for all backend requests
    var backendRoot = '';
    // default width to request for images
    var imageDefaultWidth = 1200;
    // image server root
    var imageServerRoot = '';
    // api key for accessing image server
    var imageServerApiKey = '';
    // create content modal template to use
    var createContentTemplateUrl = '';
    // mappings where pairs are <template-url>: <polymorphic_ctype[]>
    //  for looking up edit page templates
    var editPageMappings = {};
    // url for logo to display in CMS
    var logoUrl = '';
    // callback to fire when user is attempting to logout
    var logoutCallback = function () {};
    // mappings where pairs are <name>: <template-url> for looking up toolbar templates
    var toolbarMappings = {};

    var error = function (message) {
      return new ConfigError('CmsConfig', message);
    };

    var getOrFail = function (obj, key, failureMessage) {
      if (key in obj) {
        return obj[key];
      }
      throw error(failureMessage || 'Unable to find mapping.');
    };

    var findEditPageMapping = function (type) {
      return _.findKey(editPageMappings, function (types) {
        if(_.contains(types, type)) {
          return true;
        }
      });
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

    this.setImageDefaultWidth = function (num) {
      if (_.isNumber(num)) {
        imageDefaultWidth = num;
      } else {
        throw error('imageDefaultWidth must be a number!');
      }
      return this;
    };

    this.setImageServerRoot = function (value) {
      if (_.isString(value)) {
        imageServerRoot = value;
      } else {
        throw error('imageServerRoot must be a string!');
      }
      return this;
    };

    this.setImageServerApiKey = function (value) {
      if (_.isString(value)) {
        imageServerApiKey = value;
      } else {
        throw error('imageServerApiKey must be a string!');
      }
      return this;
    };

    this.setCreateContentTemplateUrl = function (value) {
      if (_.isString(value)) {
        createContentTemplateUrl = value;
      } else {
        throw error('createContentTemplateUrl must be a string!');
      }
      return this;
    };

    this.setLogoUrl = function (value) {
      if (_.isString(value)) {
        logoUrl = value;
      } else {
        throw error('logoUrl must be a string!');
      }
      return this;
    };

    this.setToolbarMappings = function (obj) {
      if (_.isObject(obj)) {
        toolbarMappings = _.clone(obj);
      } else {
        throw error('toolbarMappings must be an object!');
      }
      return this;
    };

    /**
     * Remove a polymorphic_ctype from edit page mappings.
     *
     * @param {String} type - polymorphic_ctype to remove from mappings.
     */
    this.removeEditPageMapping = function (type) {
      var template = findEditPageMapping(type);

      if (template) {
        // found mapping, remove type
        editPageMappings[template] = _.without(type);
      }

      return this;
    };

    /**
     * Add a template -> polymorphic_ctype edit page mapping.
     *
     * @param {String} templateUrl - url for edit page template.
     * @param {String|String[]} type - content type to map to template.
     */
    this.addEditPageMapping = function (templateUrl, type) {
      if (!_.isString(templateUrl)) {
        throw error('templateUrl must be a string!');
      }

      var typeIsString = _.isString(type);
      if (!(typeIsString || _.isArray(type))) {
        throw error('type must be a string or array!');
      }

      // normalize type input so we can just treat everything as an array
      var types = [];
      if (typeIsString) {
        types.push(type);
      } else {
        types = type;
      }

      _.forEach(types, function (type) {
        var mapping = findEditPageMapping(type);
        if (mapping) {
          // this type is already mapped, fail out
          throw error('type "' + type + '" is already mapped to "' + mapping +'"!');
        }

        if (templateUrl in editPageMappings) {
          // template mapping already exists, add type to list for this template
          editPageMappings[templateUrl].push(type);
        } else {
          // template mapping does not exist yet, create a new list
          editPageMappings[templateUrl] = [type];
        }
      });

      return this;
    };

    this.setEditPageMappings = function (obj) {
      if (_.isObject(obj)) {
        editPageMappings = _.clone(obj);
      } else {
        throw error('editPageMappings must be an object!');
      }
      return this;
    };

    this.setLogoutCallback = function (func) {
      if (_.isFunction(func)) {
        logoutCallback = func;
      } else {
        throw error('logoutCallback must be a function!');
      }
      return this;
    };

    this.$get = function () {
      return {
        getCreateContentTemplateUrl: _.constant(createContentTemplateUrl),
        getImageDefaultWidth: _.constant(imageDefaultWidth),
        getImageServerApiKey: _.constant(imageServerApiKey),
        getLogoUrl: _.constant(logoUrl),
        logoutCallback: logoutCallback,
        /**
         * Get the template url for given toolbar.
         *
         * @param {string} type - Type to find mapping for.
         * @returns Template url mapped to given type.
         */
        getToolbarTemplateUrl: function (type) {
          return getOrFail(toolbarMappings, type, 'Unable to find toolbar template for type "' + type + '"');
        },
        /**
         * Get edit page template for given type.
         *
         * @param {string} type - Type to find mapping for.
         * @returns Template url mapped to given type.
         */
        getEditPageTemplateUrl: function (type) {
          var template = findEditPageMapping(type);

          if (template) {
            return template;
          } else {
            throw error('Unable to find edit page template for type "' + type + '"');
          }
        },
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
         * Build a url relative to backend root.
         *
         * @param {string} relUrl - relative url to get the absolute url for.
         * @returns absolute url.
         */
        buildBackendUrl: function (relUrl) {
          return backendRoot + (relUrl || '');
        },
        /**
         * Build a url relative to image server root.
         *
         * @param {string} relUrl - relative image server url to get absolute url for.
         * @returns absolute url on image server.
         */
        buildImageServerUrl: function (relUrl) {
          return imageServerRoot + (relUrl || '');
        }
     };
    };
  });
