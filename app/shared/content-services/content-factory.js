'use strict';

angular.module('contentServices.factory', [])
  .factory('ContentFactory', function (Restangular) {
// TODO : stupid passthrough until we get rid of restangular
    return Restangular;
  });
