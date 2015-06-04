'use strict';

angular.module('apiServices.author.factory', [
  'apiServices'
])
  .factory('Author', [
    'restmod',
    function (restmod) {
      return restmod.model('author').mix({
        $config: {
          name: 'Author',
          plural: 'Authors',
          primaryKey: 'id'
        }
      });
    }
  ]);
