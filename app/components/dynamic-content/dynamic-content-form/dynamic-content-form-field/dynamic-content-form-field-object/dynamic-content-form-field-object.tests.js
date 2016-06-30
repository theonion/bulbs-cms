'use strict';

describe('Directive: dynamicContentFormFieldObject', function () {
  var $parentScope;
  var digest;
  var mockDirectiveNameKey = 'mock';
  var mockDirectiveName = 'dynamic-content-form-field-mock';

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.form.field.object',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldText');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldList');

        var key = 'DIRECTIVE_NAMES_MAP';
        var mapCopy = angular.copy($injector.get(key));
        mapCopy[mockDirectiveNameKey] = mockDirectiveName;

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
    expect(form.attr('name')).to.eql('name');
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
    $parentScope.ngModel = {};

    digest(html);

    var fields = html.find('dynamic-content-form-field-mock');
    expect(fields.length).to.eql(2);
    expect(fields.attr('name')).to.eql('title');
    expect(fields.attr('schema')).to.eql('schema.fields.title');
    expect(fields.attr('ng-model')).to.eql('ngModel.title');
  });

  it('should throw and error if no value exists for schema-defined field', function () {

    // TODO : add test code here
    throw new Error('Not implemented yet.');
  });

  it('should error out if given field type does not have a mapping', function () {
    var fieldType = 'not a real field type';
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );

    $parentScope.schema = { fields: { title: { type: fieldType } } };
    $parentScope.ngModel = {};

    expect(function () {
      digest(html);
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content-form-field-object>: "' + fieldType + '" is not a valid field type!'
    );
  });

  it('should render an object when not given a type, but schema has a `fields` property', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { my_nested_fields: { fields: {} } } };
    $parentScope.ngModel = {};

    digest(html);

    expect(html.find('dynamic-content-form-field-object').length).to.equal(1);
  });

  it('should render a text field when given a field with type text', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'text' } } };
    $parentScope.ngModel = {};

    digest(html);

    expect(html.find('dynamic-content-form-field-text').length).to.equal(1);
  });

  it('should render a list field when given a field with type array', function () {
    var html = angular.element(
      '<dynamic-content-form-field-object schema="schema" ng-model="ngModel">' +
      '</dynamic-content-form-field-object>'
    );
    $parentScope.schema = { fields: { title: { type: 'array' } } };
    $parentScope.ngModel = {};

    digest(html);

    expect(html.find('dynamic-content-form-field-list').length).to.equal(1);
  });
});
