'use strict';

describe('Directive: dynamicContentFormFieldBoolean', function () {
  var $parentScope;
  var digest;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.boolean');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      html = (
        '<form name="testForm">' +
          '<dynamic-content-form-field-boolean ' +
              'name="{{ name }}" ' +
              'ng-model="ngModel" ' +
              'schema="schema" ' +
              '>' +
          '</dynamic-content-form-field-boolean>' +
        '</form>'
      );

      $parentScope.name = 'maybe';
      $parentScope.ngModel = { maybe: true };
      $parentScope.schema = {};

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a checkbox input', function () {
    var input = digest(html).find('input');
    expect(input.attr('type')).to.equal('checkbox');
  });

  it('requires a value if schema.required is true', function () {
    $parentScope.schema.required = true;
    $parentScope.ngModel = { maybe: undefined };
    var error = digest(html).scope().testForm.$error;
    expect(error.required).to.have.length(1);
  });

  it('sets ng-readonly if input is readonly', function () {
    $parentScope.schema.read_only = true;
    var input = digest(html).find('input');
    expect(input.attr('ng-readonly')).to.eql('schema.read_only');
  });
});
