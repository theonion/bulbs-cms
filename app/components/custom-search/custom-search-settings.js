'use strict';

angular.module('customSearch.settings', [])
  .value('CUSTOM_SEARCH_CONDITION_FIELDS', [{
    name: 'Content Type',
    endpoint: 'content-type',
    value_structure: {
      name: 'name',
      value: 'doctype'
    }
  }, {
    name: 'Feature Type',
    endpoint: 'feature-type',
    value_structure: {
      name: 'name',
      value: 'slug'
    }
  }, {
    name: 'Tag',
    endpoint: 'tag',
    value_structure: {
      name: 'name',
      value: 'slug'
    }
  }])
  .value('CUSTOM_SEARCH_CONDITION_TYPES', [{
    name: 'is none of',
    value: 'none'
  }, {
    name: 'is all of',
    value: 'all'
  }, {
    name: 'is any of',
    value: 'any'
  }])
  .value('CUSTOM_SEARCH_TIME_PERIODS', [{
    name: 'Past Day',
    value: '1 day'
  }, {
    name: 'Past Week',
    value: '1 week'
  }])
  .value('CUSTOM_SEARCH_REQUEST_CAP_MS', 150);
