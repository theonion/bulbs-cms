'use strict';

describe('Directive: dynamicContentFormFieldColor', function () {
  var $parentScope;
  var digest;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.color');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      html = (
        '<form name="testForm">' +
          '<dynamic-content-form-field-color ' +
              'name="{{ name }}" ' +
              'ng-model="ngModel" ' +
              'schema="schema" ' +
              '>' +
          '</dynamic-content-form-field-color>' +
        '</form>'
      );

      $parentScope.name = 'color';
      $parentScope.ngModel = { color: '#000000' };
      $parentScope.schema = {};

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('renders a text input', function () {
    var input = digest(html).find('input[type="text"]');
    expect(input).to.have.length(1);
    expect(input.attr('ng-model')).to.eql('ngModel[name]');
    expect(input.attr('name')).to.eql('color');
  });

  it('renders a color input', function () {
    var input = digest(html).find('input[type="color"]');
    expect(input).to.have.length(1);
    expect(input.attr('ng-model')).to.eql('ngModel[name]');
    expect(input.attr('name')).to.eql('color');
  });

  it('renders a  label', function () {
    var label = digest(html).find('dynamic-content-form-field-input-label');
    expect(label).to.have.length(1);
    expect(label.attr('schema')).to.eql('schema');
    expect(label.attr('name')).to.eql('color');
  });

  it('renders errors', function () {
    var errors = digest(html).find('dynamic-content-form-field-input-errors');
    expect(errors).to.have.length(1);
    expect(errors.attr('schema')).to.eql('schema');
    expect(errors.attr('name')).to.eql('color');
  });

  describe('hex color validation', function () {
    it('it allows hex values', function () {
      $parentScope.ngModel = { color: null };
      var error = digest(html).scope().testForm.$error;
      expect(error.rgbhex).to.eql(undefined);
    });

    it('rejects mini-hex', function () {
      $parentScope.ngModel = { color: '#333' };
      var error = digest(html).scope().testForm.$error;
      expect(error.rgbhex).to.have.length(1);
    });

    it('rejects out of range hex values', function () {
      $parentScope.ngModel = { color: '#3q3q3q' };
      var error = digest(html).scope().testForm.$error;
      expect(error.rgbhex).to.have.length(1);
    });

    it('rejects non-hex values', function () {
      $parentScope.ngModel = { color: 'turquoise' };
      var error = digest(html).scope().testForm.$error;
      expect(error.rgbhex).to.have.length(1);
    });
  });

  it('requires a value if schema.required is true', function () {
    $parentScope.schema.required = true;
    $parentScope.ngModel = { color: undefined };
    var error = digest(html).scope().testForm.$error;
    expect(error.required).to.have.length(1);
  });

  it('sets ng-readonly if input is readonly', function () {
    $parentScope.schema.read_only = true;
    var colorInput = digest(html).find('input[type="color"]');
    expect(colorInput.attr('ng-readonly')).to.eql('schema.read_only');

    var textInput = digest(html).find('input[type="text"]');
    expect(textInput.attr('ng-readonly')).to.eql('schema.read_only');
  });
});
