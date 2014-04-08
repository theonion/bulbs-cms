'use strict';

describe('Service: Contentlistservice', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Contentlistservice;
  beforeEach(inject(function (_Contentlistservice_) {
    Contentlistservice = _Contentlistservice_;
  }));

  it('should do something', function () {
    expect(!!Contentlistservice).toBe(true);
  });

});
