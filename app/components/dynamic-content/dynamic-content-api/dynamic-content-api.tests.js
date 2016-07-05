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
      fields: {
        title: { field: 'string' },
        body: { field: 'string' }
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
});
