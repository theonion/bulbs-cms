'use strict';

angular.module('cms.config', [])
  .provider('CmsConfig', function CmsConfigProvider () {
    var cmsUrlRoot = '';

    this.setCmsUrlRoot = function (value) {
      if (typeof(value) === 'string') {
        cmsUrlRoot = value;
      } else {
        throw new TypeError('CmsConfig.cmsUrlRoot must be a string!');
      }
    };

    this.$get = function () {
      return {
        /**
         * Create an absolute url for the CMS by using the cmsUrlRoot.
         *
         * @param {string} relUrl - relative url to get the absolute url for.
         * @returns absolute url.
         */
        buildAbsoluteUrl: function (relUrl) {
          return cmsUrlRoot + relUrl;
        }
     };
    };
  });
