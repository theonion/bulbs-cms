'use strict';

describe('Filter: utcToTimezone', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var utcToTimezone;
  beforeEach(inject(function ($filter) {
    utcToTimezone = $filter('utcToTimezone');
  }));

  it('should return the input prefixed with "utcToTimezone filter:"', function () {
    var text = 'angularjs';
    expect(utcToTimezone(text)).toBe('utcToTimezone filter: ' + text);
  });

});
