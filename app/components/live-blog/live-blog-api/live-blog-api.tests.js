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
    sandbox.restore();
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

      LiveBlogApi.getEntries(parentId).then(callback);
      $httpBackend.flush();

      expect(callback.withArgs({ results: entries }).calledOnce).to.equal(true);
    });

    it('should transform publish dates to moment objects in the list', function () {
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

      LiveBlogApi.getEntries(parentId).then(callback);
      $httpBackend.flush();

      expect(moment.isMoment(callback.args[0][0].results[0].published)).to.equal(true);
    });

    it('should provide a way to add a new entry', function () {
      var callback = sandbox.stub();
      var entry = {
        headline: 'garbage',
        liveblog: 1
      };
      $httpBackend
        .expectPOST(CmsConfig.buildApiUrlRoot('liveblog', 'entry/'), entry)
        .respond(201, entry);

      LiveBlogApi.createEntry(entry).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(entry);
    });

    it('should transform publish date to moment in add entry response', function () {
      var callback = sandbox.stub();
      var entry = {
        published: moment.tz('America/Chicago'),
        liveblog: 1
      };
      var payload = {
        published: entry.published.format(),
        liveblog: entry.liveblog
      };
      $httpBackend
        .expectPOST(CmsConfig.buildApiUrlRoot('liveblog', 'entry/'), payload)
        .respond(201, payload);

      LiveBlogApi.createEntry(entry).then(callback);
      $httpBackend.flush();

      expect(moment.isMoment(callback.args[0][0].published)).to.equal(true);
    });

    it('should provide a way to update an entry', function () {
      var callback = sandbox.stub();
      var entry = {
        id: 30,
        headline: 'garbage',
        liveblog: 1
      };
      $httpBackend
        .expectPUT(
          CmsConfig.buildApiUrlRoot('liveblog', 'entry', entry.id, '/'),
          entry
        )
        .respond(200, entry);

      LiveBlogApi.updateEntry(entry).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(entry);
    });

    it('should transform publish date to a moment in update entry response', function () {
      var callback = sandbox.stub();
      var entry = {
        id: 30,
        published: moment.tz('America/Chicago'),
        liveblog: 1
      };
      var payload = {
        id: entry.id,
        published: entry.published.format(),
        liveblog: entry.liveblog
      };
      $httpBackend
        .expectPUT(
          CmsConfig.buildApiUrlRoot('liveblog', 'entry', entry.id, '/'),
          payload
        )
        .respond(200, payload);

      LiveBlogApi.updateEntry(entry).then(callback);
      $httpBackend.flush();

      expect(moment.isMoment(callback.args[0][0].published)).to.equal(true);
    });

    it('should provide a way to delete an entry', function () {
      var callback = sandbox.stub();
      var entry = {
        id: 30,
        headline: 'garbage',
        liveblog: 10
      };
      $httpBackend
        .expectDELETE(CmsConfig.buildApiUrlRoot('liveblog', 'entry', entry.id, '/'))
        .respond(204);

      LiveBlogApi.deleteEntry(entry).then(callback);
      $httpBackend.flush();

      expect(callback.calledOnce).to.equal(true);
    });
  });
});
