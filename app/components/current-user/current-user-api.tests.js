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

    CurrentUserApi.getCurrentUserWithCache().then(callback);
    $httpBackend.flush();

    expect(callback.withArgs(sinon.match(userData)).calledOnce).to.equal(true);
  });

  it('should prevent multiple calls to get current user', function () {
    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me/')).respond(200, {});

    CurrentUserApi.getCurrentUserWithCache();
    CurrentUserApi.getCurrentUserWithCache();

    $httpBackend.verifyNoOutstandingExpectation();
  });

  it('should provide a way to get a cached version of the current user', function () {
    var userData = { id: 1 };
    var callback = sandbox.stub();

    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me/')).respond(200, userData);
    CurrentUserApi.getCurrentUserWithCache();
    CurrentUserApi.getCurrentUserWithCache().then(callback);
    $httpBackend.flush();

    expect(callback.calledWithMatch(sinon.match(userData))).to.equal(true);
  });

  it('should provide a way to logout current user', function () {
    var userData = { id: 1 };
    var callback = sandbox.stub();

    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me/')).respond(200, userData);
    CurrentUserApi.getCurrentUserWithCache();
    $httpBackend.flush();
    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me', 'logout/')).respond(200);
    CurrentUserApi.logout().then(callback);
    $httpBackend.flush();
    $httpBackend.expectGET(CmsConfig.buildApiUrlRoot('me/')).respond(404);
    CurrentUserApi.getCurrentUserWithCache();

    $httpBackend.verifyNoOutstandingExpectation();
  });
});
