'use strict';

angular.module('contentServices.listService', [
 'contentServices.factory'
])
  .service('ContentListService', function (_, $location, $q, ContentFactory) {

    var ContentListService = this;
    // bind data object to service so we can use 2-way data binding
    // WARNING: DO NOT ACCESS THIS DIRECTLY!
    this._serviceData = {
      filters: $location.search() || {},
      content: [],
      totalItems: 0
    };
    // shorthand
    var _data = this._serviceData;

    /**
     * Update filters used for searching content data. Note: this does not actually
     *  update content.
     *
     * @param {object} addFilters - filters to append to current filters.
     * @param {Boolean} [merge=false] - false to overwrite current filters.
     */
    ContentListService.updateFilters = function (addFilters, merge) {
      if (merge) {
        _data.filters =
          _.assign($location.search() || {}, addFilters);
      } else {
        _data.filters = addFilters;
      }
      $location.search(_data.filters);
      return _data.filters;
    };

    /**
    * Update content by performing a search.
    *
    * @param {object} addFilters - filters to append to current filters before search.
    * @param {Boolean} [merge=false] - true to merge query parameters.
    * @returns {Promise} resolves with new content data.
    */
    ContentListService.$updateContent = function (addFilters, merge) {
      var updateParams = ContentListService.updateFilters(addFilters || _data.filters, merge);
      return ContentFactory.all('content').getList(updateParams)
        .then(function (data) {
          _data.content = data;
          _data.totalItems = data.metadata.count;
          // resolve promise with updated content list service data
          return _data;
        });
    };

    /**
     * Access data object, this will have a two-way data binding.
     */
    ContentListService.getData = function () {
      return _data;
    };

  });
