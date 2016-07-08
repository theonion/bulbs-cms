'use strict';

angular.module('bulbs.cms.dynamicContent.api', [])
  .service('DynamicContentApi', [
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
