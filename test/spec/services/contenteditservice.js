'use strict';

describe('Service: Contenteditservice', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Contenteditservice;
  beforeEach(inject(function (_Contenteditservice_) {
    Contenteditservice = _Contenteditservice_;
  }));

  it('should do something', function () {
    expect(!!Contenteditservice).toBe(true);
  });

});
