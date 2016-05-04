'use strict';

describe('Filter: truncateByCharacters', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var truncateByCharacters;
  beforeEach(inject(function ($filter) {
    truncateByCharacters = $filter('truncateByCharacters');
  }));

  it('should return the input with no changes when passed no argument', function () {
    var text = 'angularjs';
    expect(truncateByCharacters(text)).to.equal(text);
  });

});
