'use strict';

angular.module('bulbs.cms.dateTimeFilter', [
  'bulbs.cms.site.config',
  'lodash',
  'moment',
])
  .filter('dateTimeFormat', [
    '_', 'moment', 'CmsConfig',
    function (_, moment, CmsConfig) {
      function isInvalidDateValue (dateValue) {
        return !(
          _.isString(dateValue) ||
          _.isDate(dateValue) ||
          moment.isMoment(dateValue)
        );
      }

      return function (date, format) {
        if (isInvalidDateValue(date)) {
          return '';
        }

        if (!_.isString(format)) {
          date = moment(date);
          format = CmsConfig.getDateTimeFormatHumanReadable();
        }

        return moment.tz(date, CmsConfig.getTimezoneName()).format(format);
      };
    },
  ]);
