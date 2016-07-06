'use strict';

describe('Directive: dynamicContentFormFieldBoolean', function () {
  var $parentScope;
  var digest;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.field.boolean');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();

      digest = window.testHelper.directiveBuilderWithDynamicHtml(
        $compile,
        $parentScope
      );
    });
  });

  it('should render a checkbox input', function () {
    var html =
      '<form>' +
        '<dynamic-content-form-field-boolean ' +
            'name="{{ name }}" ' +
            'ng-model="ngModel" ' +
            'schema="schema" ' +
            '>' +
        '</dynamic-content-form-field-boolean>' +
      '</form>';
    $parentScope.name = 'title';
    $parentScope.ngModel = 'some boolean value';
    $parentScope.schema = {};

    var element = digest(html);

    expect(element.find('input').attr('type')).to.equal('checkbox');
  });
});
