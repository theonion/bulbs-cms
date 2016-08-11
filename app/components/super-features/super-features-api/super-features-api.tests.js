'use strict';

describe('Service: SuperFeaturesApi', function () {
  var $httpBackend;
  var CmsConfig;
  var dateTimeFormatFilter;
  var endpoint;
  var mockSuperFeature;
  var moment;
  var sandbox;
  var SuperFeaturesApi;

  beforeEach(function () {
    module(
      'bulbs.cms.superFeatures.api',
      function (CmsConfigProvider) {
        endpoint = '/api/root/';

        CmsConfigProvider.setApiUrlRoot(endpoint);
      }
    );

    inject(function (_$httpBackend_, _CmsConfig_, _dateTimeFormatFilter_, _moment_,
        _SuperFeaturesApi_) {
      $httpBackend = _$httpBackend_;
      CmsConfig = _CmsConfig_;
      dateTimeFormatFilter = _dateTimeFormatFilter_;
      moment = _moment_;
      SuperFeaturesApi = _SuperFeaturesApi_;

      sandbox = sinon.sandbox.create();
    });

    mockSuperFeature = {
      id: 1
    };
  });

  afterEach(function () {
    sandbox.restore();
  });

  context('utility data', function () {

    it('should provide fields for listing', function () {

      expect(SuperFeaturesApi.fields[0].title).to.equal('Super Feature Name');
      expect(SuperFeaturesApi.fields[0].sorts).to.equal('title');
      expect(SuperFeaturesApi.fields[1].title).to.equal('Sponsor');
      // TODO : sponsor content
      expect(SuperFeaturesApi.fields[2].title).to.equal('Total Nested Pages');
      expect(SuperFeaturesApi.fields[3].title).to.equal('Publish Date');
    });

    it('should provide singular name', function () {

      expect(SuperFeaturesApi.name).to.equal('Super Feature');
    });

    it('should provide plural name', function () {

      expect(SuperFeaturesApi.namePlural).to.equal('Super Features');
    });

    it('should print publish date as "Draft" if super feature has no publish date', function () {
      var superFeature = {};

      var cellContent = SuperFeaturesApi.fields[3].content(superFeature);

      expect(cellContent).to.equal('Draft');
    });

    it('should print publish date prefixed with "Scheduled" if publish date is in the future', function () {
      var publishDate = moment().add(1, 'days');
      var superFeature = {
        published: publishDate.toISOString()
      };

      var cellContent = SuperFeaturesApi.fields[3].content(superFeature);

      expect(cellContent).to.equal(dateTimeFormatFilter(publishDate, '[Scheduled for] M/D/YY h:mma z'));
    });

    it('should print publish date if publish date is now or in the past', function () {
      var publishDate = moment().subtract(1, 'days');
      var superFeature = {
        published: publishDate.toISOString()
      };

      var cellContent = SuperFeaturesApi.fields[3].content(superFeature);

      expect(cellContent).to.equal(dateTimeFormatFilter(publishDate));
    });
  });

  context('retrieving a single super feature', function () {

    it('should return the selected super feature', function () {
      var callback = sandbox.stub();
      var id = 1;
      $httpBackend
        .expectGET(CmsConfig.buildApiUrlRoot('super-feature', '' + id))
        .respond(200, mockSuperFeature);

      SuperFeaturesApi.getSuperFeature(id).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(mockSuperFeature);
    });
  });

  context('retrieving a list of super features', function () {

    it('should return super features', function () {
      var listing = {
        results: [
          mockSuperFeature,
          { id: 2 }
        ]
      };
      var callback = sandbox.stub();
      var key = 'something';
      var val = '123';
      var params = {};
      params[key] = val;
      $httpBackend
        .expectGET(CmsConfig.buildApiUrlRoot('super-feature') + '/?' + key + '=' + val)
        .respond(200, listing);

      SuperFeaturesApi.getSuperFeatures(params).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(listing);
    });
  });

  context('creating a super feature', function () {

    it('should create a new super feature', function () {
      var data = {
        title: 'my new super feature'
      };
      var callback = sandbox.stub();
      $httpBackend
        .expectPOST(CmsConfig.buildApiUrlRoot('super-feature') + '/')
        .respond(200, data);

      SuperFeaturesApi.createSuperFeature(data).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(data);
    });
  });

  context('updating a super feature', function () {

    it('should update given super feature', function () {
      var data = {
        id: 1,
        title: 'my updated super feature'
      };
      var callback = sandbox.stub();
      $httpBackend
        .expectPUT(CmsConfig.buildApiUrlRoot('super-feature', data.id))
        .respond(200, data);

      SuperFeaturesApi.updateSuperFeature(data).then(callback);
      $httpBackend.flush();

      expect(callback.args[0][0]).to.eql(data);
    });
  });

  context('deleting super feature', function () {

    it('should remove given super feature', function () {
      var data = {
        id: 1,
        title: 'my updated super feature'
      };
      var callback = sandbox.stub();
      $httpBackend
        .expectDELETE(CmsConfig.buildApiUrlRoot('super-feature', data.id))
        .respond(200, data);

      SuperFeaturesApi.deleteSuperFeature(data).then(callback);
      $httpBackend.flush();

      expect(callback.calledOnce).to.equal(true);
    });
  });
});
