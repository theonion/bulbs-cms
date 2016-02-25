'use strict';

angular.module('utils', [])
  .service('Utils', ['_', function (_) {
    var Utils = this;

    Utils.slugify = function (text) {
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
    Utils.moveTo = function (list, indexFrom, indexTo) {
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

    Utils.removeFrom = function (list, index) {
      return list.splice(index, 1).length > 0;
    };

    /**
    * Transform an object into url params.
    * ONLY knows what to do with a flat params object.
    * Similar to jQuery.param
    * @param {Object} params - Object of params to serialize.
    * @returns {String} query - a url querystring (is prefixed with '?')
    */
    Utils.param = function (params ) {
      var query = _.any(params) ? '?' : '';
      return query + _.map(params, function (value, key) {
        return key + '=' + value;
      }).join('&');
    };

    return Utils;
  }]);
