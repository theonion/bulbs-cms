'use strict';

describe('Directive: dynamicContentFormFieldInputLabel', function () {

  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.input.label');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should create a label with its `for` attribute set to given id', function () {
    var id = 'my_field_id';
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-input-label ' +
            'input-id="{{ inputId }}" ' +
            '>' +
        '</dynamic-content-form-field-input-label>' +
      '</form>'
    );
    $parentScope.inputId = id;

    digest(html);

    expect(html.find('label').attr('for')).to.equal(id);
  });

  it('should create a label with its contents as the given schema label', function () {
    var title = 'My Field Title';
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-input-label ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-input-label>' +
      '</form>'
    );
    $parentScope.schema = { label: title };

    digest(html);

    expect(html.find('label').html()).to.have.string(title);
  });

  it('should fill label with key name if not given a schema label', function () {
    var name = 'title';
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-input-label ' +
            'name="{{ name }}" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-input-label>' +
      '</form>'
    );
    $parentScope.schema = {};
    $parentScope.name = name;

    digest(html);

    expect(html.find('label').html()).to.have.string(name);
  });

  it('should show an asterisk when there is an error', function () {
    var name = 'title';
    var html = angular.element(
      '<form name="garbage">' +
        '<dynamic-content-form-field-input-label ' +
            'name="{{ name }}" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-input-label>' +
      '</form>'
    );
    $parentScope.schema = {};
    $parentScope.name = name;

    digest(html);
    html.scope().garbage[name] = { $error: { required: true } };
    $parentScope.$digest();

    expect(html.find('label').html()).to.have.string('*');
  });

  it('should not render label with a for attribute if no inputId is given', function () {
    var html = angular.element(
      '<form>' +
        '<dynamic-content-form-field-input-label>' +
        '</dynamic-content-form-field-input-label>' +
      '</form>'
    );

    digest(html);

    expect(html.find('label').attr('for')).to.equal(undefined);
  });
});
