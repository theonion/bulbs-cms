'use strict';

angular.module('apiServices.poll.factory', [
  'apiServices',
  'apiServices.mixins.fieldDisplay',
  'filters.moment',
  'ngResource'
])
  .factory('Poll', function ($resource) {
    return $resource('/cms/api/v1/poll/:pollId', null, null, {
      stripTrailingSlashes: false
    })
  });
