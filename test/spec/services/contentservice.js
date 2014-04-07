'use strict';

describe('Service: Contentservice', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Contentservice;
  beforeEach(inject(function (_Contentservice_) {
    Contentservice = _Contentservice_;
  }));

  it('should return a promise', function () {
    console.log("test here")
    console.log(Contentservice)
    expect(!!Contentservice).toBe(true);
  });

});
