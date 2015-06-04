'use strict';

describe('Filter: userDisplay', function () {

  // load the filter's module
  beforeEach(module('filters.userDisplay'));

  // initialize a new instance of the filter before each test
  var user;
  beforeEach(inject(function ($filter) {
    user = $filter('userDisplay');
  }));

  it('should return empty string when there is no user', function () {
    expect(user(null)).toBe('');
  });

  it('should return first and last name when present', function () {
    expect(user({
      first_name: 'First',
      last_name: 'Last'
    })).toBe('First Last');
  });

  it('should return username when no first and last name', function () {
    expect(user({
      username: 'username'
    })).toBe('username');
  });

});
