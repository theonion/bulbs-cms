'use strict';

describe('Service: AdApi', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var AdApi;
  beforeEach(inject(function (_AdApi_) {
    AdApi = _AdApi_;
  }));

  it('should do something', function () {
    expect(!!AdApi).to.equal(true);
  });

});
