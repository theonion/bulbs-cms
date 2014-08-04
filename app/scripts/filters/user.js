'use strict';

angular.module('bulbsCmsApp')
  .filter('user', function () {
    return function (user) {
      if (!user) { return ''; }
      if (user.full_name) {
        return user.full_name;
      } else if (user.first_name && user.last_name) {
        return user.first_name + ' ' + user.last_name;
      } else {
        return user.username;
      }
    };
  });
