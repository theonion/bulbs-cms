'use strict';

angular.module('apiServices.customSearch.groupCount.factory', [
  'apiServices',
  'apiServices.customSearch.settings'
])
  .factory('CustomSearchGroupCount', function (_, CustomSearchSettings, restmod) {

    var Count = restmod.model(CustomSearchSettings.groupCountEndpoint).mix({
      count: 0
    });

    return {
      $retrieveResultCount: function (query) {
        return Count.$create(query).$asPromise()
          .then(function (model) {
            return model.$response.data.root.count;
          });
      }
    };
  });
