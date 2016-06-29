'use strict';

describe('Directive: DynamicContentFormObject', function () {
  var $parentScope;
  var digest;
  var mockDirectiveNameKey = 'mock';
  var mockDirectiveName = 'dynamic-content-form-field-mock';

  beforeEach(function () {
    module(
      'bulbs.cms.dynamicContent.form.object',
      function ($compileProvider, $injector, $provide) {
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldMock');
        window.testHelper.directiveMock($compileProvider, 'dynamicContentFormFieldText');

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
      '<dynamic-content-form-object name="name" schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {};
    $parentScope.values = {};

    digest(html);

    var form = html.find('form');
    expect(form.length).to.eql(1);
    expect(form.attr('name')).to.eql('name');
  });

  it('should insert dynamic fields that do have a mapping', function () {
    var html = angular.element(
      '<dynamic-content-form-object schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {
      title: {
        field_type: 'mock'
      },
      body: {
        field_type: 'mock'
      }
    };
    $parentScope.values = {};

    digest(html);

    var fields = html.find('dynamic-content-form-field-mock');
    expect(fields.length).to.eql(2);
    expect(fields.attr('name')).to.eql('title');
    expect(fields.attr('schema')).to.eql('schema.title');
    expect(fields.attr('ng-model')).to.eql('values.title');
  });

  it('should error out if given field type does not have a mapping', function () {
    var fieldType = 'not a real field type';
    var html = angular.element(
      '<dynamic-content-form-object schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );

    $parentScope.schema = {
      title: {
        field_type: fieldType,
      }
    };
    $parentScope.values = {};

    expect(function () {
      digest(html);
    }).to.throw(
      BulbsCmsError,
      '<dynamic-content-form-object>: "' + fieldType + '" is not a valid field type!'
    );
  });

  it('should render a text field when given a field with type text', function () {
    var html = angular.element(
      '<dynamic-content-form-object schema="schema" values="values">' +
      '</dynamic-content-form-object>'
    );
    $parentScope.schema = { title: { field_type: 'text' } };
    $parentScope.values = {};

    digest(html);

    expect(html.find('dynamic-content-form-field-text').length).to.equal(1);
  });
});
