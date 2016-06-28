'use strict';

angular.module('bulbs.cms.page.api', [])
  .service('PageApi', [
    '$http',
    function ($http) {
      return {
        retrieveSchema: function (url) {
          return $http({
            method: 'OPTIONS',
            url: url
          });
        }
      };
    }
  ]);
