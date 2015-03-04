'use strict';

angular.module('customSearch.service', [
  'customSearch.settings',
  'customSearch.service.query.factory'
])
  .factory('CustomSearchService', function (_, ContentFactory, CUSTOM_SEARCH_REQUEST_CAP_MS,
      CustomSearchServiceQuery) {

    /**
     * Create custom search service.
     *
     * @returns service wrapper around given endpoint.
     */
    var CustomSearchService = function (params) {
      var opts = params || {};

      this.included_ids = opts.included_ids || [];
      this.excluded_ids = opts.excluded_ids || [];
      this.pinned_ids = opts.pinned_ids || [];

      this.page = opts.page || 1;
      this.query = opts.query || '';

      this.groups = [];
      if (opts.groups) {
        // build out groups if they were provided
        var self = this;
        _.forEach(opts.groups, function (group) {
          self.newQuery(group);
        });
      }

      this.content = {};

      this._contentEndpoint = ContentFactory.service('custom-search-content/');
    };

    CustomSearchService.prototype.asQueryData = function () {
      return {
        groups: _.map(this.groups, function (group) {
          return group.asQueryData();
        }),
        included_ids: this.included_ids,
        excluded_ids: this.excluded_ids,
        pinned_ids: this.pinned_ids,
        page: this.page,
        query: this.query
      };
    };

    CustomSearchService.prototype._$getContent = _.debounce(function (queryData) {
      var self = this;
      return self._contentEndpoint.post(queryData)
        .then(function (data) {
          self.content = data;
        });
    }, CUSTOM_SEARCH_REQUEST_CAP_MS);

    CustomSearchService.prototype.$filterContentByIncluded = function () {
      var contentQuery = _.pick(this.asQueryData(), [
        'groups',
        'included_ids',
        'page',
        'query'
      ]);
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$filterContentByExcluded = function () {
      var contentQuery = _.pick(this.asQueryData(), [
        'groups',
        'excluded_ids',
        'page',
        'query'
      ]);
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$retrieveContent = function () {
      var contentQuery = _.cloneDeep(this.asQueryData());
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.newQuery = function (params) {
      var newQuery = new CustomSearchServiceQuery(params);
      this.groups.push(newQuery);
      return newQuery;
    };

    CustomSearchService.prototype.removeQuery = function (index) {
      return this.groups.splice(index, 1).length > 0;
    };

    CustomSearchService.prototype.clearAllQueries = function () {
      this.groups = [];
    };

    CustomSearchService.prototype.include = function (id) {
      // add id, ensure uniqueness
      this.included_ids.push(id);
      this.included_ids = _.uniq(this.included_ids);

      // remove from exclude list
      this.unexclude(id);
    };

    CustomSearchService.prototype.uninclude = function (id) {
      this.included_ids = _.without(this.included_ids, id);
    };

    CustomSearchService.prototype.isIncluded = function (id) {
      return _.includes(this.included_ids, id);
    };

    CustomSearchService.prototype.exclude = function (id) {
      // exclude id, ensure unqiueness
      this.excluded_ids.push(id);
      this.excluded_ids = _.uniq(this.excluded_ids);

      // remove from include list and pinned list
      this.uninclude(id);
      this.unpin(id);
    };

    CustomSearchService.prototype.unexclude = function (id) {
      this.excluded_ids = _.without(this.excluded_ids, id);
    };

    CustomSearchService.prototype.isExcluded = function (id) {
      return _.includes(this.excluded_ids, id);
    };

    CustomSearchService.prototype.pin = function (id) {
      // pin id, ensure unqiueness
      this.pinned_ids.push(id);
      this.pinned_ids = _.uniq(this.pinned_ids);

      // remove from exclude list
      this.unexclude(id);
    };

    CustomSearchService.prototype.unpin = function (id) {
      this.pinned_ids = _.without(this.pinned_ids, id);
    };

    CustomSearchService.prototype.isPinned = function (id) {
      return _.includes(this.pinned_ids, id);
    };

    return CustomSearchService;
  });
