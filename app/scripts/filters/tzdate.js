'use strict';

angular.module('bulbsCmsApp')
  .filter('tzDate', function (dateFilter, moment, TIMEZONE_NAME) {
    return function (input, format) {
      if (!input) {
        return '';
      }
      var inDate = moment.tz(input, TIMEZONE_NAME);
      var newdate = inDate.format('YYYY-MM-DDTHH:mm');
      var formattedDate = dateFilter(newdate, format);
      if (format.toLowerCase().indexOf('h') > -1) {
        formattedDate += ' ' + inDate.format('z');
      }
      return formattedDate;
    };
  });
