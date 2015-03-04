'use strict';

angular.module('customSearch.service.query.factory', [
  'customSearch.settings',
  'customSearch.service.condition.factory'
])
  .factory('CustomSearchServiceQuery', function (_, $q, ContentFactory,
      CustomSearchServiceCondition, CUSTOM_SEARCH_TIME_PERIODS) {

    var CustomSearchServiceQuery = function (params) {
      var opts = params || {};

      this.conditions = opts.conditions || [];
      this.result_count = opts.result_count || 0;
      this.time = opts.time || null;

      this.conditions = [];
      if (opts.conditions) {
        // build out conditions if they were provided
        var self = this;
        _.forEach(opts.conditions, function (condition) {
          self.newCondition(condition);
        });
      }

      this._countEndpoint = ContentFactory.service('custom-search-content/count/');
    };

    CustomSearchServiceQuery.prototype.asQueryData = function () {
      return {
        conditions: _.map(this.conditions, function (condition) {
          return condition.asQueryData();
        }),
        time: this.time ? this.time : null
      };
    };

    CustomSearchServiceQuery.prototype.$updateResultCount = function () {
      var self = this;
      return self._countEndpoint.post(self.asQueryData())
        .then(function (data) {
          self.result_count = data.count;
        });
    };

    CustomSearchServiceQuery.prototype.addTimePeriod = function () {
      this.time = CUSTOM_SEARCH_TIME_PERIODS[0].value;
      return this.time;
    };

    CustomSearchServiceQuery.prototype.removeTimePeriod = function () {
      this.time = null;
    };

    CustomSearchServiceQuery.prototype.newCondition = function (params) {
      var newCondition = new CustomSearchServiceCondition(params);
      this.conditions.push(newCondition);
      return newCondition;
    };

    CustomSearchServiceQuery.prototype.removeCondition = function (index) {
      return this.conditions.splice(index, 1).length > 0;
    };

    return CustomSearchServiceQuery;
  });
