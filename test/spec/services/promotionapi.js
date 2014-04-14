'use strict';

describe('Service: PromotionApi', function () {

  // load the service's module
  beforeEach(module('bulbsCmsApp'));

  // instantiate service
  var PromotionApi;
  beforeEach(inject(function (_PromotionApi_) {
    PromotionApi = _PromotionApi_;
  }));

  it('should do something', function () {
    expect(!!PromotionApi).toBe(true);
  });

});
