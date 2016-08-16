'use strict';

angular.module('statusFilter.config', [
  'bulbs.cms.site.config',
  'contentServices.listService',
  'moment'
])
  .provider('StatusFilterOptions', function (moment) {
    var _statuses = [
      {label: 'Draft', key: 'status', value: 'Draft'},
      {label: 'Awaiting Review', key: 'status', value: 'Waiting for Editor'},
      {label: 'Published', key: 'before', value: function () { return moment().format('YYYY-MM-DDTHH:mmZ'); }},
      {label: 'Scheduled', key: 'after', value: function () { return moment().format('YYYY-MM-DDTHH:mmZ'); }},
      {label: 'All', key: null, value: null}
    ];

    this.setStatuses = function (statuses) {
      _statuses = statuses;
    };

    this.$get = function () {
      return {
        getStatuses: function () {
          return _statuses;
        }
      };
    };
  });
