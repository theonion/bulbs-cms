'use strict';

angular.module('bulbs.cms.utils', [
  'lodash'
])
  .provider('Utils', [
    '_',
    function (_) {

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
       * In given list, swaps item at indexFrom with item at indexTo.
       *
       * @param {Array} list - list to swap items in.
       * @param {Number} indexFrom - Index to move content from.
       * @param {Number} indexTo - Index to move content to.
       * @param {Boolean} allowOutOfBounds - true to perform move when given
       *    indexTo that's out of bounds.
       * @returns {Boolean} true if item was moved, false otherwise.
       */
      Utils.moveTo = function (list, indexFrom, indexTo, allowOutOfBounds) {
        var ret = false;
        var modIndexTo = indexTo;

        if (allowOutOfBounds) {
          if (indexTo < 0) {
            modIndexTo = 0;
          } else if (indexTo >= list.length) {
            modIndexTo = list.length - 1;
          }
        }

        if (indexFrom >= 0 && indexFrom < list.length &&
            modIndexTo >= 0 && modIndexTo < list.length) {
          var splicer = list.splice(indexFrom, 1, list[modIndexTo]);
          if (splicer.length > 0) {
            list[modIndexTo] = splicer[0];
            ret = true;
          }
        }

        return ret;
      };

      /**
       * In given list, remove an item at given index.
       *
       * @param {Array} list - list to remove item from.
       * @param {Number} index - index of item to remove.
       * @returns {Boolean} true if item was removed, false otherwise.
       */
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
      Utils.param = function (params) {
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

      Utils.path = {
        /**
         * Join path strings.
         *
         * @param {...String} A variable number of strings to join into path.
         * @returns {String} joined path.
         */
        join: function () {
          var sep = '/';
          var replace = new RegExp(sep + '{1,}', 'g');
          var argsArr = _.flattenDeep(arguments);

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

      Utils.$get = [
        '$q',
        function ($q) {
          /**
           * Create a lock to apply to wrapped functions so that only one of the
           *  functions using this lock can be run at a time.
           *
           * @returns {function} function that can be used to wrap functions that
           *  should be locked by this instance of a lock. The wrapped function can
           *  then be called as the original function would be called, but the result
           *  will be wrapped in a promise.
           */
          Utils.buildLock = function () {
            var locked = false;

            return {
              wrap: function (func) {

                return function () {
                  if (!locked) {
                    locked = true;

                    return $q
                      .when(func.apply(null, arguments))
                      .finally(function () {
                        locked = false;
                      });
                  }
                };
              },
              isLocked: function () {
                return locked;
              }
            };
          };

          return Utils;
        }
      ];

      return Utils;
    }
  ]);
