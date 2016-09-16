'use strict';

describe('Service: CurrentUserApi', function () {
  var $httpBackend;
  var CmsConfig;
  var endpoint;
  var CurrentUserApi;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.currentUser.api',
      function (CmsConfigProvider) {
        endpoint = '/api/root/';

        CmsConfigProvider.setApiUrlRoot(endpoint);
      }
    );

    inject(function (_$httpBackend_, _CmsConfig_, _CurrentUserApi_) {

      $httpBackend = _$httpBackend_;
      CmsConfig = _CmsConfig_;
      CurrentUserApi = _CurrentUserApi_;
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should provide a way to get the current user', function () {
    var userData = { id: 1 };
    var callback = sandbox.stub();
    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me/'))
      .respond(200, userData);

    CurrentUserApi.getCurrentUser().then(callback);
    $httpBackend.flush();

    expect(callback.withArgs(sinon.match(userData)).calledOnce).to.equal(true);
  });
});
