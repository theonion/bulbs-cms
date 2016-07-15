'use strict';

describe('Directive: dynamicContentFormFieldText', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.text');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a text input', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-text ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-text>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.find('input').attr('type')).to.equal('text');
  });

  it('should have max length validation when given a schema with max_length', function () {
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-text ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-text>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = { max_length: $parentScope.ngModel.length - 1 };

    var element = digest(html);

    expect(element.scope().myForm.title.$error.maxlength).to.equal(true);
  });

  it('should not validate max length by default', function () {
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-text ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-text>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.scope().myForm.title.$error.maxlength).to.equal(undefined);
  });

  it('should have required validation when given a schema with required', function () {
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-text ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-text>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = '';
    $parentScope.schema = { required: true };

    var element = digest(html);

    expect(element.scope().myForm.title.$error.required).to.equal(true);
  });

  it('should render a readonly input when given a schema with readonly', function () {
    var html =
      '<form name="myForm">' +
        '<dynamic-content-form-field-text ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-text>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = { read_only: true };

    var element = digest(html);

    expect(element.find('input').attr('readonly')).to.equal('readonly');
  });
});
