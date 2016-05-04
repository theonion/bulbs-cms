'use strict';

describe('Filter: truncateByWords', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var truncateByWords;
  beforeEach(inject(function ($filter) {
    truncateByWords = $filter('truncateByWords');
  }));

  it('should return the input with no changes when passed no argument', function () {
    var text = 'angularjs';
    expect(truncateByWords(text)).to.equal(text);
  });

});
