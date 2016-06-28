'use strict';

describe('Service: DynamicContentApi', function () {

  var $httpBackend;
  var DynamicContentApi;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.api');

    inject(function (_$httpBackend_, _DynamicContentApi_) {
      $httpBackend = _$httpBackend_;
      DynamicContentApi = _DynamicContentApi_;
    });
  });

  it('should provide a way to retrieve the schema for a given piece of content', function () {
    var url = '/some/schema/url';
    var schema = {
      title: { field_type: 'text' },
      body: { field_type: 'text' }
    };
    $httpBackend.expect('OPTIONS', url).respond(function () {
      return [200, schema];
    });

    var apiSchema;
    DynamicContentApi.retrieveSchema(url)
      .success(function (response) {
        apiSchema = response;
      });
    $httpBackend.flush();

    expect(apiSchema).to.eql(schema);
  });
});
