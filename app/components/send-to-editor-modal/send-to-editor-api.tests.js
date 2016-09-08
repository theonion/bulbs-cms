'use strict';

describe('Service: SendToEditorApi', function () {
  var $httpBackend;
  var CmsConfig;
  var endpoint;
  var sandbox;
  var SendToEditorApi;

  beforeEach(function () {
    module(
      'bulbs.cms.sendToEditorModal.api',
      function (CmsConfigProvider) {
        endpoint = '/api/root/';

        CmsConfigProvider.setApiUrlRoot(endpoint);
      }
    );

    inject(function (_$httpBackend_, _CmsConfig_, _SendToEditorApi_) {
      $httpBackend = _$httpBackend_;
      CmsConfig = _CmsConfig_;
      SendToEditorApi = _SendToEditorApi_;

      sandbox = sinon.sandbox.create();
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should provide a way to send a status and note to editoral', function () {
    var article = { id: 1 };
    var callback = sandbox.stub();
    var note = 'Hello!';
    var status = 'Garbage';
    var response = { status: status };
    $httpBackend
      .expectPOST(CmsConfig.buildApiUrlRoot('content', article.id, 'send/'))
      .respond(200, response);

    SendToEditorApi.sendToEditor(article, status, note).then(callback);
    $httpBackend.flush();

    expect(callback.args[0][0]).to.eql(response);
  });
});
