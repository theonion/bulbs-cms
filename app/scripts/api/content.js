'use strict';

angular.module('bulbs.api')
  .factory('ContentService', function (Restangular) {
    Restangular.setBaseUrl('/cms/api/v1/');
    Restangular.setRequestSuffix('/');

    Restangular.extendModel('content', function (obj) {

      var extendAuthor = function (author) {
        return angular.extend(author, {
          getFullName: function () {
            return obj.contributor.first_name + ' ' + obj.contributor.last_name;
          }
        });
      };

      for (var i in obj.authors) {
        obj.authors[i] = extendAuthor(obj.authors[i]);
      }
      return obj;
    });

    Restangular.extendModel('contributions', function (obj) {
      if (obj && obj.contributor) {
        obj.contributor = angular.extend(obj.contributor, {
          getFullName: function () {
            return obj.contributor.first_name + ' ' + obj.contributor.last_name;
          }
        });
      }
      return obj;
    });

    Restangular.extendCollection('contributions', function (collection) {
      collection.save = function (data) {
        return collection.post(data).then(function (contributions) {
          return Restangular.restangularizeCollection('contributions', contributions);
        });
      };
      return collection;
    });

    return Restangular.service('content');
  });
