'use strict';

describe('Directive: dynamicContentFormFieldRichtext', function () {
  var $parentScope;
  var $sce;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.richtext');
    module('jsTemplates');

    inject(function (_$sce_, $compile, $rootScope) {
      $parentScope = $rootScope.$new();
      $sce = _$sce_;

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a text input by default', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-richtext ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-richtext>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.find('input').attr('type')).to.equal('text');
    expect(element.find('onion-editor').length).to.equal(0);
  });

  it('should render a multi-line editor when given a schema with field_type long', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-richtext ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-richtext>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = { field_size: 'long' };

    var element = digest(html);

    expect(element.find('onion-editor').attr('role')).to.equal('multiline');
  });

  it('should render a readonly input field with read_only and no field_size', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-richtext ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-richtext>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = { read_only: true };

    var element = digest(html);

    expect(element.find('input').attr('readonly')).to.equal('readonly');
  });

  it('should render static html when given a schema with read_only and long field_size', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-richtext ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-richtext>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = $sce.trustAsHtml('some text value');
    $parentScope.schema = {
      field_size: 'long',
      read_only: true
    };

    var element = digest(html);

    expect(element.find('.dynamic-content-form-field-richtext-read-only').html())
      .to.have.string($parentScope.ngModel.toString());
    expect(element.find('onion-editor').length).to.equal(0);
  });

  it('should render a required field when given a schema with required', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-richtext ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-richtext>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some text value';
    $parentScope.schema = { required: true };

    var element = digest(html);

    expect(element.find('input').attr('required')).to.equal('required');
  });
});
