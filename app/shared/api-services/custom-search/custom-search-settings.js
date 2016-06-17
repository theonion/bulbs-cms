'use strict';

angular.module('apiServices.customSearch.settings', [])
  .service('CustomSearchSettings', function () {

    return {
      searchEndpoint: 'custom-search-content',
      groupCountEndpoint: 'custom-search-content/group_count',
      countEndpoint: 'custom-search-content/count'
    };
  });
