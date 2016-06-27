describe('Service: PageApi', function () {

  var $httpBackend;
  var PageApi;

  beforeEach(function () {
    module('bulbs.cms.page.api');

    inject(function (_$httpBackend_, _PageApi_) {
      $httpBackend = _$httpBackend_;
      PageApi = _PageApi_;
    });
  });

  it('should provide a way to retrieve the schema for a given piece of content', function () {
    var url = '/some/schema/url';
    var schema = {
      title: { field_type: 'text' },
      body: { field_type: 'text' }
    };
    $httpBackend.expect('OPTIONS', url).respond(function () {
      return [200, schema]
    });

    var apiSchema;
    PageApi.retrieveSchema(url)
      .success(function (response) {
        apiSchema = response;
      });
    $httpBackend.flush();

    expect(apiSchema).to.eql(schema);
  });
});
