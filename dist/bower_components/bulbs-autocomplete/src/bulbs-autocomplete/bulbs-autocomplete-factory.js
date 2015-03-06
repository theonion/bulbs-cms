'use strict';

angular.module('BulbsAutocomplete.factory', [])
  .factory('BulbsAutocomplete', [function () {

    var BulbsAutocomplete = function (getItemsFunction) {
      if (_.isFunction(getItemsFunction)) {
        this._getItems = getItemsFunction;
      } else {
        throw 'BulbsAutocomplete Factory: Creation failed, getItemsFunction must be defined';
      }
    };

    BulbsAutocomplete.prototype.$retrieve = function () {
      var self = this;
      return self._getItems()
        .then(function (results) {
          self._items = results;
          return self._items;
        })
        .catch(function (error) {
          return error;
        });
    };

    return BulbsAutocomplete;
  }]);
