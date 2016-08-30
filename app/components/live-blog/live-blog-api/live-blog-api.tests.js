'use strict';

describe('Service: LiveBlogApi', function () {
  var $httpBackend;
  var CmsConfig;
  var endpoint;
  var LiveBlogApi;
  var moment;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.liveBlog.api',
      function (CmsConfigProvider) {
        endpoint = '/api/root/';

        CmsConfigProvider.setApiUrlRoot(endpoint);
      }
    );

    inject(function (_$httpBackend_, _CmsConfig_, _LiveBlogApi_, _moment_) {
      $httpBackend = _$httpBackend_;
      CmsConfig = _CmsConfig_;
      LiveBlogApi = _LiveBlogApi_;
      moment = _moment_;
    });
  });

  afterEach(function () {
    sandbox.create();
  });

  context('live blog entries', function () {

    it('should provide a method to get a list', function () {
      var callback = sandbox.stub();
      var parentId = 1;
      var entries = [{
        id: 2,
        liveblog: parentId
      }, {
        id: 3,
        liveblog: parentId
      }];
      $httpBackend
        .expectGET(CmsConfig.buildApiUrlRoot('liveblog', 'entry') + '/?liveblog=' + parentId)
        .respond(200, { results: entries });

      LiveBlogApi.getLiveBlogEntries(parentId).then(callback);
      $httpBackend.flush();

      expect(callback.withArgs({ results: entries }).calledOnce).to.equal(true);
    });

    it('should transform publish dates to moment objects', function () {
      var callback = sandbox.stub();
      var parentId = 2;
      var entry = {
        id: 1,
        liveblog: parentId,
        published: '2016-04-20T04:20:00Z'
      };
      $httpBackend
        .expectGET(CmsConfig.buildApiUrlRoot('liveblog', 'entry') + '/?liveblog=' + parentId)
        .respond(200, { results: [entry] });

      LiveBlogApi.getLiveBlogEntries(parentId).then(callback);
      $httpBackend.flush();

      expect(moment.isMoment(callback.args[0][0].results[0].published)).to.equal(true)
    });
  });
});
