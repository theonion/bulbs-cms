'use strict';

angular.module('apiServices.customSearch.settings', [])
  .constant('CUSTOM_SEARCH_ENDPOINT', 'custom-search-content')
  .constant('CUSTOM_SEARCH_REL_COUNT_ENDPOINT', 'count')
  .constant('CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT', 'group_count')
  .service('CustomSearchSettings', function (CUSTOM_SEARCH_ENDPOINT,
      CUSTOM_SEARCH_REL_COUNT_ENDPOINT, CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT) {

    return {
      searchEndpoint: CUSTOM_SEARCH_ENDPOINT,
      groupCountEndpoint: CUSTOM_SEARCH_ENDPOINT + '/' + CUSTOM_SEARCH_REL_GROUP_COUNT_ENDPOINT,
      countEndpoint: CUSTOM_SEARCH_ENDPOINT + '/' + CUSTOM_SEARCH_REL_COUNT_ENDPOINT
    };
  });
