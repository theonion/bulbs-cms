'use strict';

describe('ContentService', function () {

  var ContentService, $httpBackend;
  beforeEach(function () {

    module('bulbs.api');
    module('bulbs.api.mock');

    inject(function ($controller, $injector) {
      ContentService = $injector.get('ContentService');
      $httpBackend = $injector.get('$httpBackend');
    });
  });

  it('should get a content detail', function () {
    ContentService.one(6).get().then(function (content) {
      expect(content.id).to.equal(6);
    });
    $httpBackend.flush();
  });

  it('should return the contributions for content', function () {
    ContentService.one(6).all('contributions').getList().then(function (contributions) {
      expect(contributions.length).to.equal(3);
      expect(contributions[0].contributor.getFullName()).to.equal('Chris Sinchok');
    });
    $httpBackend.flush();
  });

  it('should update the contributions for content', function () {
    var data = {
      id: 7,
      content: 1234,
      contributor: {
        id: 3,
        first_name: 'Shawn',
        last_name: 'Cook',
        username: 'scook'
      },
      role: {
        id: 3,
        name: 'Programmer'
      }
    };

    ContentService.one(6).all('contributions').post([data]).then(function (contributions) {
      expect(contributions.length).to.equal(1);
      expect(contributions[0]).to.eql(data);
    });
    $httpBackend.flush();
  });

  it('should update the contributions for content', function () {
    var data = {
      id: 7,
      content: 1234,
      contributor: {
        id: 3,
        first_name: 'Shawn',
        last_name: 'Cook',
        username: 'scook'
      },
      role: {
        id: 3,
        name: 'Programmer'
      }
    };

    ContentService.one(6).all('contributions').save([data]).then(function (contributions) {
      expect(contributions.length).to.equal(1);
      expect(contributions[0].id).to.equal(data.id);
    });
    $httpBackend.flush();
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

});
