'use strict';

describe('Filter: dateTimeFormat', function () {
  var CmsConfig;
  var filter;
  var moment;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.dateTimeFilter');

    inject(function ($filter, _CmsConfig_, _moment_) {
      CmsConfig = _CmsConfig_;
      filter = $filter('dateTimeFormat');
      moment = _moment_;
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should return a date string for given date with given format', function () {
    console.log(moment().tz(CmsConfig.getTimezoneName()).format('z'));
    console.log(moment().tz(CmsConfig.getTimezoneName()).format('ZZ'));

    var date = moment('2016-04-20T04:20:00').tz(CmsConfig.getTimezoneName());
    var format = 'MM/DD/YYYY hh:mm';

    var value = filter(date, format);

    expect(value).to.equal('04/20/2016 04:20');
  });

  it('should return nothing if not given a string or moment', function () {

    expect(filter(123)).to.equal('');
    expect(filter(false)).to.equal('');
    expect(filter(null)).to.equal('');
    expect(filter(undefined)).to.equal('');
  });

  it('should default date time format to configured', function () {
    var date = moment('2016-04-20T04:20:00').tz(CmsConfig.getTimezoneName());
    CmsConfig.getDateTimeFormatHumanReadable = sandbox.stub().returns('MM/DD/YYYY hh:mm');

    var value = filter(date);

    expect(value).to.equal('04/20/2016 04:20');
  });

  it('should use configured time zone', function () {
    CmsConfig.getTimezoneName = sandbox.stub().returns('Africa/Abidjan');

    var value = filter(moment(), 'ZZ');

    expect(value).to.equal('+0000');
  });
});
