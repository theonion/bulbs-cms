'use strict';

/**
 * Wrapper functions for custom search endpoints.
 */
angular.module('apiServices.customSearch.factory', [
  'apiServices.customSearch.count.factory',
  'apiServices.customSearch.groupCount.factory',
  'apiServices.customSearch.settings',
  'lodash',
  'restmod'
])
  .factory('CustomSearch', function (_, restmod, CustomSearchCount, CustomSearchGroupCount,
      CustomSearchSettings) {

    var CustomSearch = restmod.model(CustomSearchSettings.searchEndpoint).mix({
      $config: {
        jsonRootSingle: 'results'
      },
      $hooks: {
        'before-save': function (_req) {
          _req.url += '/?page=' + _req.data.page;
        }
      }
    });

    return {
      $retrieveResultCount: CustomSearchCount.$retrieveResultCount,
      $retrieveGroupCount: CustomSearchGroupCount.$retrieveResultCount,
      $retrieveContent: function (query) {
        return CustomSearch.$create(query).$asPromise()
          .then(function (model) {
            return model.$response.data;
          });
      }
    };
  });
