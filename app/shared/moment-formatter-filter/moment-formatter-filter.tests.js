'use strict';

describe('Shared: Moment Formatter Filter', function () {

  var moment;

  // load the directive's module
  beforeEach(function () {

    module('bulbsCmsApp');
    module('momentFormatterFilter');

    inject(function (_moment_) {
      moment = _moment_;
    });

  });

  it('has a moment filter', inject(function($filter) {
      expect($filter('momentFormatter')).not.toBeNull();
  }));

  it('moment filter should turn invalid dates into blank strings', inject(function (momentFormatterFilter) {
      expect(momentFormatterFilter('')).toBe('');
      expect(momentFormatterFilter('invalid date')).toBe('');
  }));

  it('moment filter should format date strings', inject(function (momentFormatterFilter) {
      expect(momentFormatterFilter('2015-03-19T18:00:00-05:00', 'MM/DD/YY')).toBe('03/19/15');
  }));

  it('moment filter should format moments into date strings', inject(function (momentFormatterFilter) {
      expect(momentFormatterFilter(moment('2015-03-19T18:00:00-05:00'), 'MM/DD/YY')).toBe('03/19/15');
  }));

});
