'use strict';

angular.module('customSearch.service', [
  'customSearch.settings',
  'apiServices.customSearch.factory'
])
  .factory('CustomSearchService', function (_, CustomSearch, CUSTOM_SEARCH_CONDITION_FIELDS,
      CUSTOM_SEARCH_CONDITION_TYPES, CUSTOM_SEARCH_REQUEST_CAP_MS, CUSTOM_SEARCH_TIME_PERIODS) {

    var defaultData = {
      groups: [],
      includedIds: [],
      excludedIds: [],
      pinnedIds: []
    };

    /**
     * Create custom search service.
     *
     * @returns service wrapper around given endpoint.
     */
    var CustomSearchService = function (data) {

      this.data(data);

      this.$page = 1;
      this.$query = '';

      this.content = {};
    };

    CustomSearchService.prototype.data = function (data) {

      if (_.isUndefined(data)) {
        this._data = defaultData;
      } else {
        this._data = _.defaults(data, defaultData);
      }

      return this._data;
    };

    CustomSearchService.prototype._$getContent = _.debounce(function (queryData) {
      var self = this;
      return CustomSearch.$retrieveContent(queryData)
        .then(function (data) {
          self.content = data;
        });
    }, CUSTOM_SEARCH_REQUEST_CAP_MS);

    CustomSearchService.prototype.$filterContentByIncluded = function () {
      var contentQuery = {
        includedIds: this._data.includedIds,
        page: this.$page,
        query: this.$query
      };
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$filterContentByExcluded = function () {
      var contentQuery = {
        includedIds: this._data.excludedIds,
        page: this.$page,
        query: this.$query
      };
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$retrieveContent = function () {
      var contentQuery = _.assign({
        page: this.$page,
        query: this.$query,
        preview: true
      }, this._data);
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$groupsUpdateResultCountFor = function (index) {
      var self = this;
      return (function (index) {
        return CustomSearch.$retrieveGroupCount(self._data.groups[index])
          .then(function (count) {
            self._data.groups[index].$result_count = count;
          });
      })(index);
    };

    CustomSearchService.prototype.groupsResultCountGet = function (index) {
      return this._data.groups[index].$result_count || 0;
    };

    CustomSearchService.prototype.groupsList = function () {
      return this._data.groups;
    };

    CustomSearchService.prototype.groupsAdd = function (data) {
      if (_.isUndefined(data)) {
        data = {};
      }

      data = _.defaults(data, {
        conditions: [],
        time: null,
        $result_count: 0
      });

      this._data.groups.push(data);
      return data;
    };

    CustomSearchService.prototype.groupsGet = function (index) {
      return this._data.groups[index];
    };

    CustomSearchService.prototype.groupsRemove = function (index) {
      return this._data.groups.splice(index, 1).length > 0;
    };

    CustomSearchService.prototype.groupsClear = function () {
      this._data.groups = [];
    };

    CustomSearchService.prototype.groupsConditionsAdd = function (groupIndex, data) {
      if (_.isUndefined(data)) {
        data = {};
      }

      data = _.defaults(data, {
        field: CUSTOM_SEARCH_CONDITION_FIELDS[0].endpoint,
        type: CUSTOM_SEARCH_CONDITION_TYPES[0].value,
        values: []
      });

      this._data.groups[groupIndex].conditions.push(data);
      return data;
    };

    CustomSearchService.prototype.groupsConditionsGet = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex];
    };

    CustomSearchService.prototype.groupsConditionsList = function (groupIndex) {
      return this._data.groups[groupIndex].conditions;
    };

    CustomSearchService.prototype.groupsConditionsRemove = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions.splice(conditionIndex, 1).length > 0;
    };

    CustomSearchService.prototype.groupsTimePeriodSet = function (groupIndex) {
      var value = CUSTOM_SEARCH_TIME_PERIODS[0].value;
      this._data.groups[groupIndex].time = value;
      return value;
    };

    CustomSearchService.prototype.groupsTimePeriodGet = function (groupIndex) {
      return this._data.groups[groupIndex].time || null;
    };

    CustomSearchService.prototype.groupsTimePeriodRemove = function (groupIndex) {
      this._data.groups[groupIndex].time = null;
    };

    CustomSearchService.prototype.groupsConditionsValuesAdd = function (groupIndex, conditionIndex, value) {
      var values = this._data.groups[groupIndex].conditions[conditionIndex].values;
      var matches = _.find(values, function (existingValue) {
        return existingValue.name === value.name && existingValue.value === value.value;
      });

      if (!matches) {
        values.push(value);
      }
    };

    CustomSearchService.prototype.groupsConditionsValuesClear = function (groupIndex, conditionIndex) {
      this._data.groups[groupIndex].conditions[conditionIndex].values = [];
    };

    CustomSearchService.prototype.groupsConditionsValuesList = function (groupIndex, conditionIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex].values;
    };

    CustomSearchService.prototype.groupsConditionsValuesRemove = function (groupIndex, conditionIndex, valueIndex) {
      return this._data.groups[groupIndex].conditions[conditionIndex].values.splice(valueIndex, 1).length > 0;
    };

    CustomSearchService.prototype.includesList = function () {
      return this._data.includedIds;
    };

    CustomSearchService.prototype.includesAdd = function (id) {
      // add id, ensure uniqueness
      this._data.includedIds.push(id);
      this._data.includedIds = _.uniq(this._data.includedIds);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.includesRemove = function (id) {
      this._data.includedIds = _.without(this._data.includedIds, id);
    };

    CustomSearchService.prototype.includesHas = function (id) {
      return _.includes(this._data.includedIds, id);
    };

    CustomSearchService.prototype.excludesList = function () {
      return this._data.excludedIds;
    };

    CustomSearchService.prototype.excludesAdd = function (id) {
      // exclude id, ensure unqiueness
      this._data.excludedIds.push(id);
      this._data.excludedIds = _.uniq(this._data.excludedIds);

      // remove from include list and pinned list
      this.includesRemove(id);
      this.pinsRemove(id);
    };

    CustomSearchService.prototype.excludesRemove = function (id) {
      this._data.excludedIds = _.without(this._data.excludedIds, id);
    };

    CustomSearchService.prototype.excludesHas = function (id) {
      return _.includes(this._data.excludedIds, id);
    };

    CustomSearchService.prototype.pinsList = function () {
      return this._data.pinnedIds;
    };

    CustomSearchService.prototype.pinsAdd = function (id) {
      // pin id, ensure unqiueness
      this._data.pinnedIds.push(id);
      this._data.pinnedIds = _.uniq(this._data.pinnedIds);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.pinsRemove = function (id) {
      this._data.pinnedIds = _.without(this._data.pinnedIds, id);
    };

    CustomSearchService.prototype.pinsHas = function (id) {
      return _.includes(this._data.pinnedIds, id);
    };

    CustomSearchService.prototype.getPage = function () {
      return this.$page;
    };

    CustomSearchService.prototype.setPage = function (page) {
      this.$page = page;
    };

    CustomSearchService.prototype.getQuery = function () {
      return this.$query;
    };

    CustomSearchService.prototype.setQuery = function (query) {
      this.$query = query;
    };

    return CustomSearchService;
  });
