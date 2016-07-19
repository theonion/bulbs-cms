'use strict';

describe('Directive: dynamicContentFormFieldObject', function () {
  var $parentScope;
  var digest;
  var mockDirectiveNameKey = 'mock';
  var mockDirectiveName = 'dynamic-content-form-field-mock';
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    module(
      'bulbs.cms.dynamicContent.form.field.object',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');

        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldBoolean');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldColor');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldDateTime');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldImage');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldInteger');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldList');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldRichtext');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldText');

        var key = 'FIELD_TYPES_META';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy[mockDirectiveNameKey] = { tagName: mockDirectiveName };

        $provide.constant(key, mapCopy);
      }
    );
    module('jsTemplates');

   inject(function ($compile, $rootScope) {
     $parentScope = $rootScope.$new();

     digest = window.testHelper.directiveBuilderWithDynamicHtml(
       $compile,
       $parentScope
     );
   });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should render a form', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object name="name" schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );

    $parentScope.schema = {};
    $parentScope.ngModel = {};

    digest(html);

    var form = html.find('ng-form');
    expect(form.length).to.eql(1);
    expect(form.attr('name')).to.eql('form');
  });

  it('should insert dynamic fields that do have a mapping', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );

    $parentScope.schema = {
      fields: {
        title: {
          type: 'mock'
        },
        body: {
          type: 'mock'
        }
      }
    };
    $parentScope.ngModel = {
      title: '',
      body: ''
    };

    digest(html);

    var fields = html.find('dynamic-content-form-field-mock');
    expect(fields.length).to.eql(2);
    expect(fields.attr('name')).to.eql('title');
    expect(fields.attr('schema')).to.eql('schema.fields.title');
    expect(fields.attr('ng-model')).to.eql('ngModel.title');
    expect(fields.hasClass('dynamic-content-form-field'));
  });

  it('should throw and error if no value exists for schema-defined field', function () {
    var fieldName = 'title';
    $parentScope.schema = { fields: {} };
    $parentScope.schema.fields[fieldName] = { type: 'mock' };
    $parentScope.ngModel = {};

    expect(function () {
      digest(
        '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
        '</dynamic-content-form-field-object>'
      );
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content-form-field-object>: "' + fieldName + '" has no matching value!'
    );
  });

  it('should error out if given field type does not have a mapping', function () {
    var fieldKey = 'title';
    var fieldType = 'not a real field type';
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: {} };
    $parentScope.schema.fields[fieldKey] = { type: fieldType };
    $parentScope.ngModel = {};
    $parentScope.ngModel[fieldKey] = '';

    expect(function () {
      digest(html);
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content-form-field-object>: "' + fieldKey + '" has an invalid field type "' + fieldType + '"!'
    );
  });

  it('should render an object when not given a type, but schema has a `fields` property', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { my_nested_fields: { fields: {} } } };
    $parentScope.ngModel = { my_nested_fields: {} };

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should render an image field when given a field with type image', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );

    $parentScope.schema = { fields: { my_image: { type: 'image' } } };
    $parentScope.ngModel = { my_image: { id: 1 } };

    digest(html);

    expect(html.find('dynamic-content-form-field-image').length).to.equal(1);
  });

  it('should render a date field when given a field with type date', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );

    $parentScope.schema = { fields: { some_date: { type: 'datetime' } } };
    $parentScope.ngModel = { some_date: '2016-04-20T00:00:00+00:00' };

    digest(html);

    expect(html.find('dynamic-content-form-field-date-time').length).to.equal(1);
  });

  it('should render a rich text field when given a field with type richtext', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'richtext' } } };
    $parentScope.ngModel = { title: '' };

    digest(html);

    expect(html.find('dynamic-content-form-field-richtext').length).to.equal(1);
  });

  it('should render a text field when given a field with type string', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'string' } } };
    $parentScope.ngModel = { title: '' };

    digest(html);

    expect(html.find('dynamic-content-form-field-text').length).to.equal(1);
  });

  it('should render a integer field when given a field with type integer', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { quantity: { type: 'integer' } } };
    $parentScope.ngModel = { quantity: 10 };

    digest(html);

    expect(html.find('dynamic-content-form-field-integer').length).to.equal(1);
  });

  it('should render a boolean field when given a field with type boolean', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { flagForReview: { type: 'boolean' } } };
    $parentScope.ngModel = { flagForReview: true };

    digest(html);

    expect(html.find('dynamic-content-form-field-boolean').length).to.equal(1);
  });

  it('should render a color field when given a field with type color', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'color' } } };
    $parentScope.ngModel = { title: '' };

    digest(html);

    expect(html.find('dynamic-content-form-field-color').length).to.equal(1);
  });

  it('should render a list field when given a field with type array', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'array' } } };
    $parentScope.ngModel = { title: '' };

    digest(html);

    expect(html.find('dynamic-content-form-field-list').length).to.equal(1);
  });

  it('should have a hook into changes to form validity', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object ' +
        'schema="schema" ' +
        'ng-model="ngModel" ' +
        'on-validity-change="formValidCallback(isValid)" ' +
        '>' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'mock' } } };
    $parentScope.ngModel = { title: '' };
    $parentScope.formValidCallback = sandbox.stub();

    var element = digest(html);
    var directiveScope = element.isolateScope();

    directiveScope.form.$valid = false;
    directiveScope.$digest();

    // initial call
    expect($parentScope.formValidCallback.withArgs(true).callCount).to.equal(1);
    // after digest call
    expect($parentScope.formValidCallback.withArgs(false).callCount).to.equal(1);
  });

  it('should allow rendering of only a subset of fields', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object ' +
        'schema="schema" ' +
        'ng-model="ngModel" ' +
        'include-only="includes"' +
        '>' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = {
      fields: {
        title: {
          type: 'string'
        },
        some_count: {
          type: 'integer'
        },
        is_active: {
          type: 'boolean'
        }
      }
    };
    $parentScope.ngModel = { title: '', some_count: 2, is_active: false };
    $parentScope.includes = ['title', 'is_active'];

    digest(html);

    expect(html.find('dynamic-content-form-field-text').length).to.equal(1);
    expect(html.find('dynamic-content-form-field-integer').length).to.equal(0);
    expect(html.find('dynamic-content-form-field-boolean').length).to.equal(1);
  });

  it('should render a message if schema is missing a fields key', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object ' +
        'schema="schema" ' +
        'ng-model="ngModel" ' +
        '>' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = {};
    $parentScope.ngModel = {}

    digest(html);

    expect(html.html()).to.have.string('Schema is malformed');
  });
});
