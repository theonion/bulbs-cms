'use strict';

angular.module('customSearch.service.condition.factory', [
  'customSearch.settings'
])
  .factory('CustomSearchServiceCondition', function (_, CUSTOM_SEARCH_CONDITION_FIELDS,
      CUSTOM_SEARCH_CONDITION_TYPES) {

    var CustomSearchServiceCondition = function (params) {
      var opts = params || {};

      this.field = opts.field || CUSTOM_SEARCH_CONDITION_FIELDS[0].endpoint;
      this.type = opts.type || CUSTOM_SEARCH_CONDITION_TYPES[0].value;

      this.values = [];
      if (opts.values) {
        // values provided, build them out
        var self = this;
        _.forEach(opts.values, function (value) {
          self.addValue(value);
        });
      }
    };

    CustomSearchServiceCondition.prototype.asQueryData = function () {
      return _.pick(this, ['field', 'type', 'values']);
    };

    CustomSearchServiceCondition.prototype.addValue = function (value) {
      var matches = _.find(this.values, function (existingValue) {
        return existingValue.name === value.name && existingValue.value === value.value;
      });

      if (!matches) {
        this.values.push(value);
      }
    };

    CustomSearchServiceCondition.prototype.removeValue = function (index) {
      return this.values.splice(index, 1).length > 0;
    };

    CustomSearchServiceCondition.prototype.clearAllValues = function () {
      this.values = [];
    };

    return CustomSearchServiceCondition;
  });
