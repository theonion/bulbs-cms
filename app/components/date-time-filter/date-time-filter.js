'use strict';

angular.module('bulbs.cms.dateTimeFilter', [
  'bulbs.cms.site.config',
  'lodash',
  'moment'
])
  .filter('dateTimeFormat', [
    '_', 'moment', 'CmsConfig',
    function (_, moment, CmsConfig) {
      return function (date, format) {

        if (!_.isString(date) && !moment.isMoment(date)) {
          return '';
        }

        if (!_.isString(format)) {
          format = CmsConfig.getDateTimeFormatHumanReadable();
        }

        return moment.tz(date, CmsConfig.getTimezoneName()).format(format);
      };
    }
  ]);
