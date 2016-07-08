'use strict';

describe('Directive: dynamicContentFormFieldInteger', function () {
  var $parentScope;
  var digest;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.integer');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      html = (
        '<form name="testForm">' +
          '<dynamic-content-form-field-integer ' +
              'name="{{ name }}" ' +
              'ng-model="ngModel" ' +
              'schema="schema" ' +
              '>' +
          '</dynamic-content-form-field-integer>' +
        '</form>'
      );

      $parentScope.name = 'quantity';
      $parentScope.ngModel = 10;
      $parentScope.schema = {};

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('renders a number input', function () {
    var input = digest(html).find('input');
    expect(input).to.have.length(1);
    expect(input.attr('type')).to.eql('number');
    expect(input.attr('ng-model')).to.eql('ngModel');
    expect(input.attr('name')).to.eql('quantity');
  });

  it('renders a  label', function () {
    var label = digest(html).find('dynamic-content-form-field-input-label');
    expect(label).to.have.length(1);
    expect(label.attr('schema')).to.eql('schema');
    expect(label.attr('name')).to.eql('quantity');
  });

  it('renders errors', function () {
    var errors = digest(html).find('dynamic-content-form-field-input-errors');
    expect(errors).to.have.length(1);
    expect(errors.attr('schema')).to.eql('schema');
    expect(errors.attr('name')).to.eql('quantity');
  });

  describe('integer validation', function () {
    it('rejects float values', function () {
      $parentScope.ngModel = 3.4;
      var error = digest(html).scope().testForm.$error;
      expect(error.integer).to.have.length(1);
    });

    it('allows blank values', function () {
      $parentScope.ngModel = null;
      var error = digest(html).scope().testForm.$error;
      expect(error.integer).to.be.undefined;
    });

    it('allows integer values', function () {
      $parentScope.ngModel = 5;
      var error = digest(html).scope().testForm.$error;
      expect(error.integer).to.be.undefined;
    });
  });

  it('requires a value if schema.required is true', function () {
    $parentScope.schema.required = true;
    $parentScope.ngModel = undefined;
    var error = digest(html).scope().testForm.$error;
    expect(error.required).to.have.length(1);
  });

  it('limits the maximum value if schema.max_value is set', function () {
    $parentScope.schema.max_value = 10;
    $parentScope.ngModel = 11; // Why don't you just make ten louder?
    var error = digest(html).scope().testForm.$error;
    expect(error.max).to.have.length(1);
  });

  it('limits the minimum value if schema.min_value is set', function () {
    $parentScope.schema.min_value = 4;
    $parentScope.ngModel = 2;
    var error = digest(html).scope().testForm.$error;
    expect(error.min).to.have.length(1);
  });

  it('sets ng-readonly if input is readonly', function () {
    $parentScope.schema.read_only = true;
    var input = digest(html).find('input');
    expect(input.attr('ng-readonly')).to.eql('schema.read_only');
  });
});
