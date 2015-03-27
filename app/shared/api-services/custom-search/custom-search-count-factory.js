'use strict';

angular.module('apiServices.customSearch.count.factory', [
  'apiServices',
  'apiServices.customSearch.settings'
])
  .factory('CustomSearchCount', function (_, CustomSearchSettings, restmod) {

    var Count = restmod.model(CustomSearchSettings.countEndpoint).mix({
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
