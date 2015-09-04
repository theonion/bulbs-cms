'use strict';

angular.module('contentServices.factory', [
  'restangular'
])
  .factory('ContentFactory', function (Restangular) {
// TODO : stupid passthrough until we get rid of restangular
    return Restangular;
  });
