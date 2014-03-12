'use strict';

describe('Filter: truncateByCharacters', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var truncateByCharacters;
  beforeEach(inject(function ($filter) {
    truncateByCharacters = $filter('truncateByCharacters');
  }));

  it('should return the input prefixed with "truncateByCharacters filter:"', function () {
    var text = 'angularjs';
    expect(truncateByCharacters(text)).toBe('truncateByCharacters filter: ' + text);
  });

});
