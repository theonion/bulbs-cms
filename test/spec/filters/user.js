'use strict';

describe('Filter: user', function () {

  // load the filter's module
  beforeEach(module('bulbsCmsApp'));

  // initialize a new instance of the filter before each test
  var user;
  beforeEach(inject(function ($filter) {
    user = $filter('user');
  }));

  it('should return empty string when there is no user', function () {
    expect(user(null)).toBe('');
  });

  it('should return first and last name when present', function () {
    expect(user({
      first_name: "First",
      last_name: "Last"
    })).toBe("First Last");
  });

  it('should return username when no first and last name', function () {
    expect(user({
      username: "username"
    })).toBe("username");
  });

});
