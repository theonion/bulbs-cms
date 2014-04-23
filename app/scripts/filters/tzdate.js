'use strict';

angular.module('bulbsCmsApp')
  .filter('tzDate', function (dateFilter, moment, TIMEZONE_OFFSET) {
    return function (input, format) {
      var newdate = moment(input).zone(TIMEZONE_OFFSET).format('YYYY-MM-DDTHH:mm');
      var formattedDate = dateFilter(newdate, format)
      return formattedDate;
    };
  });
