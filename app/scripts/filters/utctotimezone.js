'use strict';

angular.module('bulbsCmsApp')
  .filter('utcToTimezone', function (moment, TIMEZONE_OFFSET) {
    return function (input) {
      console.log("utc To Timezone here");
      console.log(input)
      var newdate = moment(input).zone(TIMEZONE_OFFSET).format('YYYY-MM-DDTHH:mmZ');
      console.log(newdate)
      return newdate;
    };
  });
