'use strict';

angular.module('momentFormatterFilter', ['moment'])
  // Used for HTML formatting. Date can be any valid moment constructor.
  .filter('momentFormatter', function(moment) {
    return function(date, format) {
      var m = moment(date);
      if (m.isValid()) {
        return m.format(format);
      } else {
        return '';
      }
    };
  });
