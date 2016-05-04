'use strict';
/*jshint -W030 */

describe('Filter: moment', function () {

  var $filter;
  var moment;

  // load the directive's module
  beforeEach(function () {

    module('filters.moment');

    inject(function (_$filter_, _moment_) {
      $filter = _$filter_;
      moment = _moment_;
    });

  });

  describe('date_string_to_moment', function () {
    var filter;

    beforeEach(function () {
      filter = $filter('date_string_to_moment');
    });

    it('should translate iso date strings into moments', function () {
      var date = moment().format();
      expect(filter(date).isSame(moment(date))).to.equal(true);
    });

    it('should convert invalid/blank iso date strings into null', function () {
      expect(filter('')).to.be.null;
      expect(filter('invalid date')).to.be.null;
    });
  });

  describe('moment_to_date_string', function () {
    var filter;

    beforeEach(function () {
      filter = $filter('moment_to_date_string');
    });

    it('should translate invalid moments to empty strings', function () {
      expect(filter(moment(''))).to.equal('');
    });

    it('should translate moments to iso date strings', function () {
      var date = moment();
      expect(filter(date)).to.equal(date.format());
    });
  });
});
