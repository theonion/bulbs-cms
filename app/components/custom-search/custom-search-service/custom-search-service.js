'use strict';

angular.module('customSearch.service', [
  'customSearch.settings'
])
  .factory('CustomSearchService', function (_, ContentFactory, CUSTOM_SEARCH_CONDITION_FIELDS,
      CUSTOM_SEARCH_CONDITION_TYPES, CUSTOM_SEARCH_REQUEST_CAP_MS, CUSTOM_SEARCH_TIME_PERIODS) {

    /**
     * Create custom search service.
     *
     * @returns service wrapper around given endpoint.
     */
    var CustomSearchService = function (data) {

      if (_.isUndefined(data)) {
        throw 'Given data for CustomSearchService is undefined!';
      }

      this._data = _.defaults(data, {
        groups: [],
        included_ids: [],
        excluded_ids: [],
        pinned_ids: [],
        page: 1,
        query: ''
      });

      this._contentEndpoint = ContentFactory.service('custom-search-content/');
      this._groupCountEndpoint = ContentFactory.service('custom-search-content/group_count/');

      this.content = {};
    };

    CustomSearchService.prototype._$getContent = _.debounce(function (queryData) {
      var self = this;
      return self._contentEndpoint.post(queryData)
        .then(function (data) {
          self.content = data;
        });
    }, CUSTOM_SEARCH_REQUEST_CAP_MS);

    CustomSearchService.prototype.$filterContentByIncluded = function () {
      var contentQuery = _.pick(this._data, [
        'included_ids',
        'page',
        'query'
      ]);
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$filterContentByExcluded = function () {
      var contentQuery = _.pick(this._data, [
        'page',
        'query'
      ]);
      contentQuery.included_ids = this._data.excluded_ids;
      return this._$getContent(contentQuery);
    };

    CustomSearchService.prototype.$retrieveContent = function () {
      return this._$getContent(this._data);
    };

    CustomSearchService.prototype.$groupsUpdateResultCountFor = function (index) {
      var self = this;
      return (function (index) {
        return self._groupCountEndpoint.post(self._data.groups[index])
          .then(function (data) {
            self._data.groups[index].result_count = data.count;
          });
      })(index);
    };

    CustomSearchService.prototype.groupsResultCountGet = function (index) {
      return this._data.groups[index].result_count || 0;
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
        result_count: 0
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
      return this._data.included_ids;
    };

    CustomSearchService.prototype.includesAdd = function (id) {
      // add id, ensure uniqueness
      this._data.included_ids.push(id);
      this._data.included_ids = _.uniq(this._data.included_ids);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.includesRemove = function (id) {
      this._data.included_ids = _.without(this._data.included_ids, id);
    };

    CustomSearchService.prototype.includesHas = function (id) {
      return _.includes(this._data.included_ids, id);
    };

    CustomSearchService.prototype.excludesList = function () {
      return this._data.excluded_ids;
    };

    CustomSearchService.prototype.excludesAdd = function (id) {
      // exclude id, ensure unqiueness
      this._data.excluded_ids.push(id);
      this._data.excluded_ids = _.uniq(this._data.excluded_ids);

      // remove from include list and pinned list
      this.includesRemove(id);
      this.pinsRemove(id);
    };

    CustomSearchService.prototype.excludesRemove = function (id) {
      this._data.excluded_ids = _.without(this._data.excluded_ids, id);
    };

    CustomSearchService.prototype.excludesHas = function (id) {
      return _.includes(this._data.excluded_ids, id);
    };

    CustomSearchService.prototype.pinsList = function () {
      return this._data.pinned_ids;
    };

    CustomSearchService.prototype.pinsAdd = function (id) {
      // pin id, ensure unqiueness
      this._data.pinned_ids.push(id);
      this._data.pinned_ids = _.uniq(this._data.pinned_ids);

      // remove from exclude list
      this.excludesRemove(id);
    };

    CustomSearchService.prototype.pinsRemove = function (id) {
      this._data.pinned_ids = _.without(this._data.pinned_ids, id);
    };

    CustomSearchService.prototype.pinsHas = function (id) {
      return _.includes(this._data.pinned_ids, id);
    };

    CustomSearchService.prototype.getPage = function () {
      return this._data.page;
    };

    CustomSearchService.prototype.setPage = function (page) {
      this._data.page = page;
    };

    CustomSearchService.prototype.getQuery = function () {
      return this._data.query;
    };

    CustomSearchService.prototype.setQuery = function (query) {
      this._data.query = query;
    };

    return CustomSearchService;
  });
