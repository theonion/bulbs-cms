'use strict';

angular.module('bulbsCmsApp')
  .filter('tzDate', function (dateFilter, moment, CmsConfig) {
    return function (input, format) {
      if (!input) {
        return '';
      }
      var inDate = moment.tz(input, CmsConfig.getTimezoneName());
      var newdate = inDate.format('YYYY-MM-DDTHH:mm');
      var formattedDate = dateFilter(newdate, format);
      if (format.toLowerCase().indexOf('h') > -1) {
        formattedDate += ' ' + inDate.format('z');
      }
      return formattedDate;
    };
  });
