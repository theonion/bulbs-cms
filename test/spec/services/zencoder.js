'use strict';

describe('Service: Zencoder', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var Zencoder;
  beforeEach(inject(function (_Zencoder_) {
    Zencoder = _Zencoder_;
  }));

  it('should do something', function () {
    expect(!!Zencoder).to.equal(true);
  });

});
