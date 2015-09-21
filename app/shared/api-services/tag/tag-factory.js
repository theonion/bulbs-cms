'use strict';

angular.module('apiServices.tag.factory', [
  'apiServices'
])
  .factory('Tag', function (_, restmod) {
    return restmod.model('tag').mix({
      $config: {
        name: 'Tag',
        plural: 'Tags',
        primaryKey: 'id'
      }
    });
  });
