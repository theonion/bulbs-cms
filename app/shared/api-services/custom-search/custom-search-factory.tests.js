'use strict';

describe('Factory: CustomSearch', function () {

  var $httpBackend;
  var $rootScope;
  var API_URL_ROOT;
  var CustomSearch;
  var CustomSearchSettings;

  beforeEach(function () {
    module('apiServices.customSearch.factory');

    inject(function (_$httpBackend_, _$rootScope_, _API_URL_ROOT_, _CustomSearch_,
        _CustomSearchSettings_) {

      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      API_URL_ROOT = _API_URL_ROOT_;
      CustomSearch = _CustomSearch_;
      CustomSearchSettings = _CustomSearchSettings_;
    });
  });

  it('should be able to retrieve the result count for the entire list', function () {

    var count = 5;
    var respCount;

    CustomSearch.$retrieveResultCount().then(function (count) {
      respCount = count;
    });

    $httpBackend.expectPOST(API_URL_ROOT + CustomSearchSettings.countEndpoint + '/')
      .respond({count: count});
    $httpBackend.flush();

    expect(respCount).to.equal(count);
  });

  it('should be able to retrieve the result count for a single group', function () {

    var count = 5;
    var respCount;

    CustomSearch.$retrieveGroupCount().then(function (count) {
      respCount = count;
    });

    $httpBackend.expectPOST(API_URL_ROOT + CustomSearchSettings.groupCountEndpoint + '/')
      .respond({count: count});
    $httpBackend.flush();

    expect(respCount).to.equal(count);
  });

  it('should be able to retrieve the content for a list', function () {

    var content = {results: []};
    var page = 1;
    var respContent;

    CustomSearch.$retrieveContent({page: 1}).then(function (data) {
      respContent = data;
    });

    $httpBackend
      .expectPOST(API_URL_ROOT + CustomSearchSettings.searchEndpoint + '/?page=' + page)
      .respond(content);
    $httpBackend.flush();

    expect(respContent).to.eql(content);
  });
});
