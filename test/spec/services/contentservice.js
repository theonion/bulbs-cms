'use strict';

describe('Service: Contentservice', function () {
  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Contentservice
  beforeEach(inject(function (_Contentservice_) {
    Contentservice = _Contentservice_;
  }));

  it('should return a promise', function () {
    expect(Contentservice.then).toBeDefined();
  });

  it('should return a promise that resolves to a content list', function () {


  });

});
