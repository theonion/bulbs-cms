'use strict';

describe('Filter: tzDate', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var tzDate;
  beforeEach(inject(function ($filter) {
    tzDate = $filter('tzDate');
  }));

  it('should return the input prefixed with "tzDate filter:"', function () {
    var text = 'angularjs';
    expect(tzDate(text)).toBe('tzDate filter: ' + text);
  });

});
