'use strict';

describe('Service: Login', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Login;
  beforeEach(inject(function (_Login_) {
    Login = _Login_;
  }));

  it('should do something', function () {
    expect(!!Login).toBe(true);
  });

});
