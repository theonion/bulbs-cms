'use strict';

describe('Directive: dynamicContentForm', function () {

  var $parentScope;
  var digest;
  var DynamicContentApi;
  var deferred;
  var sandbox;
  var schemaSrc = '/some/url/for/schema';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.dynamicContent.form',
      function ($compileProvider) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldObject');
      }
    );
    module('jsTemplates');

    inject(function ($compile, $q, $rootScope, _DynamicContentApi_) {
      $parentScope = $rootScope.$new();
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
    $parentScope.ngModel = {};

    digest('<dynamic-content-form schema-src="{{ schemaSrc }}" ng-model="ngModel"></dynamic-content>');

    expect(DynamicContentApi.retrieveSchema.calledOnce).to.equal(true);
  });

  it('should show an error message if schema retrieval fails', function () {
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" ng-model="ngModel"></dynamic-content>'
    );

    digest(html);
    deferred.reject();
    $parentScope.$digest();

    expect(html.html()).to.have.string('Unable to retrieve schema');
  });

  it('should show a loading message before form has loaded', function () {
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" ng-model="ngModel"></dynamic-content>'
    );

    digest(html);

    expect(html.html()).to.have.string('Loading dynamic content schema...');
  });

  it('should throw an error if not given a schema source', function () {
    $parentScope.ngModel = {};

    expect(function () {
      digest('<dynamic-content-form ng-model="ngModel"></dynamic-content>');
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content>: must be provided a schema url!'
    );
  });

  it('should throw an error if not given an ng-model', function () {
    $parentScope.schemaSrc = schemaSrc;

    expect(function () {
      digest('<dynamic-content-form schema-src="{{ schemaSrc }}"></dynamic-content>');
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content>: must be provided an object for ng-model!'
    );
  });

  it('should include a <dynamic-content-form-field-object>', function () {
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" ng-model="ngModel"></dynamic-content>'
    );
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};
    deferred.resolve({ fields: { title: { field: 'mock' } } });

    digest(html);

    var form = html.find('dynamic-content-form-field-object');
    expect(form.length).to.equal(1);
    expect(form.attr('schema')).to.equal('schema');
    expect(form.attr('ng-model')).to.equal('ngModel');
  });

  it('should assign the schema to the ngModel', function () {
    var html = angular.element(
      '<dynamic-content-form schema-src="{{ schemaSrc }}" ng-model="ngModel"></dynamic-content>'
    );
    var schemaResponse = { data: { fields: { title: { field: 'mock' } } } }
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};

    deferred.resolve(schemaResponse);
    digest(html);

    var form = html.find('dynamic-content-form-field-object');
    expect(form.length).to.equal(1);
    expect($parentScope.ngModel._schema).to.equal(schemaResponse.data);
  });

  it('should have a hook into changes to form validity', function () {
    var isValid = true;
    var html = angular.element(
      '<dynamic-content-form ' +
        'schema-src="{{ schemaSrc }}" ' +
        'ng-model="ngModel" ' +
        'on-validity-change="formValidCallback(isValid)" ' +
        '>' +
      '</dynamic-content>'
    );
    $parentScope.formValidCallback = sandbox.stub();
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};

    var element = digest(html);
    element.isolateScope().validityCallback(isValid);

    expect($parentScope.formValidCallback.withArgs(isValid).calledOnce).to.equal(true);
  });

  it('should allow pass through of include-only attribute', function () {
    var html = angular.element(
      '<dynamic-content-form ' +
        'schema-src="{{ schemaSrc }}" ' +
        'ng-model="ngModel" ' +
        'include-only="includeOnly" ' +
        '>' +
      '</dynamic-content>'
    );
    $parentScope.schemaSrc = schemaSrc;
    $parentScope.ngModel = {};
    deferred.resolve({ fields: { title: { field: 'mock' } } });
    $parentScope.includeOnly = ['title'];

    digest(html);

    var form = html.find('dynamic-content-form-field-object');
    expect(form.length).to.equal(1);
    expect(form.attr('schema')).to.equal('schema');
    expect(form.attr('ng-model')).to.equal('ngModel');
    expect(form.attr('include-only')).to.equal('includeOnly');
  });
});
