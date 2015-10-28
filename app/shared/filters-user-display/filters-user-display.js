'use strict';

angular.module('filters.userDisplay', [])
  .filter('userDisplay', [
    function () {
      return function (user) {
        var name = '';

        if (user) {
          if (user.full_name) {
            name = user.full_name;
          } else if (user.first_name && user.last_name) {
            name = user.first_name + ' ' + user.last_name;
          } else {
            name = user.username;
          }
        }

        return name;
      };
    }
  ]);
