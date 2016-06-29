'use strict';

describe('Directive: dynamicContentForm', function () {

  var $parentScope;
  var digest;
  var html;
  var DynamicContentApi;
  var deferred;
  var sandbox;
  var schemaSrc = '/some/url/for/schema';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module('bulbs.cms.dynamicContent.form');
    module('jsTemplates');

    inject(function ($compile, $q, $rootScope, _DynamicContentApi_) {
      $parentScope = $rootScope.$new();
      $parentScope.schemaSrc = schemaSrc;
      html = angular.element('<dynamic-content></dynamic-content>');
      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
      DynamicContentApi = _DynamicContentApi_;

      deferred = $q.defer();
      sandbox.stub(DynamicContentApi, 'retrieveSchema')
        .withArgs(schemaSrc).returns(deferred.promise);
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should call out to retrieve schema at given src', function () {
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.values = {};

    digest('<dynamic-content-form schema-src="{{ schemaSrc }}" values="values"></dynamic-content>');

    expect(DynamicContentApi.retrieveSchema.calledOnce).to.equal(true);
  });

  it('should show an error message if schema retrieval fails', function () {
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.values = {};
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" values="values"></dynamic-content>'
    );

    digest(html);
    deferred.reject();
    $parentScope.$digest();

    expect(html.html().indexOf('Unable to retrieve schema') > -1)
      .to.equal(true);
  });

  it('should show a loading message before form has loaded', function () {
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.values = {};
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" values="values"></dynamic-content>'
    );

    digest(html);

    expect(html.html().indexOf('Loading dynamic content schema...') > -1).to.equal(true);
  });

  it('should throw an error if not given a schema source', function () {
    $parentScope.values = {};

    expect(function () {
      digest('<dynamic-content-form values="values"></dynamic-content>');
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content>: must be provided a schema url!'
    );
  });

  it('should throw an error if not given values', function () {
    $parentScope.schemaSrc = schemaSrc;

    expect(function () {
      digest('<dynamic-content-form schema-src="{{ schemaSrc }}"></dynamic-content>');
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content>: must be provided a value object!'
    );
  });

  it('should include a named form', function () {
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" values="values"></dynamic-content>'
    );
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.values = {};
    deferred.resolve({});

    digest(html);

    var form = html.find('form');
    expect(form.length).to.equal(1);
    expect(form.attr('name')).to.equal('dynamicContentForm');
  });
});
