'use strict';

describe('Service: DynamicContentApi', function () {

  var $httpBackend;
  var apiUrlRoot = '/my/api/';
  var DynamicContentApi;

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.api',
      function (CmsConfigProvider) {
        CmsConfigProvider.setApiUrlRoot(apiUrlRoot);
      }
    );

    inject(function (_$httpBackend_, _DynamicContentApi_) {
      $httpBackend = _$httpBackend_;
      DynamicContentApi = _DynamicContentApi_;
    });
  });

  it('should provide a way to retrieve the schema for a given piece of content', function () {
    var url = '/some/schema/url';
    var schema = {
      fields: {
        title: { field: 'richtext' },
        body: { field: 'richtext' }
      }
    };
    $httpBackend.expect('OPTIONS', url).respond(function () {
      return [200, schema];
    });

    var apiSchema;
    DynamicContentApi.retrieveSchema(url)
      .then(function (response) {
        apiSchema = response.data;
      });
    $httpBackend.flush();

    expect(apiSchema).to.eql(schema);
  });

  it('should provide a way to retrieve relations for a given piece of content', function () {
    var parentId = 1;
    var relations = [{
      id: 1,
      internal_name: 'Some Internal Name',
      title: 'The First Relation',
      status: 'Draft'
    }];
    var url = apiUrlRoot + parentId + '/relations';
    $httpBackend.expect('GET', url).respond(function () {
      return [200, relations];
    });

    var apiRelations;
    DynamicContentApi.retrieveRelations(parentId)
      .then(function (response) {
        apiRelations = response.data;
      });
    $httpBackend.flush();

    expect(apiRelations).to.eql(relations);
  });
});
