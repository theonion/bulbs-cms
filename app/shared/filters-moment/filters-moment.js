'use strict';

angular.module('filters.moment', [
  'moment'
])
  .filter('date_string_to_moment', function(moment) {
    return function (dateStr) {
      // Try to parse non-empty strings
      if (dateStr && dateStr.length) {
        var m = moment(dateStr);
        if (m.isValid()) {
          return m;
        }
      }
      return null;
    };
  })
  .filter('moment_to_date_string', function(moment) {
    return function (momentObj) {
      if (moment.isMoment(momentObj) && momentObj.isValid()) {
        return momentObj.format();
      } else {
        // Blank time string == not set
        return '';
      }
    };
  });
