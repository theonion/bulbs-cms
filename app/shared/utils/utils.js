'use strict';

angular.module('bulbs.cms.utils', [])
  .provider('Utils', ['_', function (_) {

    this.slugify = function (text) {
      // https://gist.github.com/mathewbyrne/1280286
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    };

    /**
     * Content moving function.
     *
     * @param {Number} indexFrom - Index to move content from.
     * @param {Number} indexTo - Index to move content to.
     * @returns {Boolean} true if content moved, false otherwise.
     */
    this.moveTo = function (list, indexFrom, indexTo) {
      var ret = false;

      if (indexFrom >= 0 && indexFrom < list.length &&
          indexTo >= 0 && indexTo < list.length) {
        var splicer = list.splice(indexFrom, 1, list[indexTo]);
        if (splicer.length > 0) {
          list[indexTo] = splicer[0];
          ret = true;
        }
      }
      return ret;
    };

    this.removeFrom = function (list, index) {
      return list.splice(index, 1).length > 0;
    };

    /**
    * Transform an object into url params.
    * ONLY knows what to do with a flat params object.
    * Similar to jQuery.param
    * @param {Object} params - Object of params to serialize.
    * @returns {String} query - a url querystring (is prefixed with '?')
    */
    this.param = function (params) {
      if (!params) {
        params = {};
      }
      var keys = Object.keys(params);
      var query = '';
      if (keys.length > 0) {
        query += '?';
        query += keys.map(function (key) {
          return key + '=' + params[key];
        })
        .join('&');
      }
      return query;
    };

    this.path = {
      /**
       * Join path strings.
       *
       * @param {...String} A variable number of strings to join into path.
       * @returns {String} joined path.
       */
      join: function () {
        var sep = '/';
        var replace = new RegExp(sep + '{1,}', 'g');
        var argsArr = Array.prototype.slice.call(arguments);
        // if there's a protocol, make sure to ignore it when replacing sep
        var protocolPrefix = '';
        if (argsArr.length > 0 && typeof(argsArr[0]) === 'string') {
          var matches = argsArr[0].match(/^(https?:)?\/\//);
          if (matches) {
            protocolPrefix = matches[0];
            argsArr[0] = argsArr[0].replace(protocolPrefix, '');
          }
        }
        return protocolPrefix + argsArr.join(sep).replace(replace, sep);
      }
    };

    this.$get = [
      function () {
        return this;
      }
    ];

    return this;
  }]);
