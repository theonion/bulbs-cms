'use strict';

angular.module('bulbs.api')
  .factory('AuthorService', function (Restangular) {
    Restangular.setBaseUrl('/cms/api/v1/');
    Restangular.setRequestSuffix('/');
    Restangular.extendModel('author', function (obj) {
      return angular.extend(obj, {
        getFullName: function () {
          return obj.first_name + ' ' + obj.last_name;
        }
      });
    });
    return Restangular.all('author');
  });
