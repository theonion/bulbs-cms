'use strict';

describe('Service: ContentRelationsApi', function () {

  var $httpBackend;
  var apiUrlRoot = '/my/api/';
  var ContentRelationsApi;

  beforeEach(function () {
    module(
      'bulbs.cms.content.relations.api',
      function (CmsConfigProvider) {
        CmsConfigProvider.setApiUrlRoot(apiUrlRoot);
      }
    );

    inject(function (_$httpBackend_, _ContentRelationsApi_) {
      $httpBackend = _$httpBackend_;
      ContentRelationsApi = _ContentRelationsApi_;
    });
  });

  it('should provide a way to retrieve relations for a given piece of content', function () {
    var parentId = 1;
    var relations = [{
      id: 1,
      title: 'The First Relation',
      status: 'Draft'
    }];
    var url = apiUrlRoot + parentId + '/relations';
    $httpBackend.expect('GET', url).respond(function () {
      return [200, relations];
    });

    var apiRelations;
    ContentRelationsApi.retrieveRelations(parentId)
      .then(function (response) {
        apiRelations = response.data;
      });
    $httpBackend.flush();

    expect(apiRelations).to.eql(relations);
  });
});
