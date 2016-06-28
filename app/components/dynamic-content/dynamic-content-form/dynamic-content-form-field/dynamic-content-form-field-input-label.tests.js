'use strict';

describe('Directive: pageFormFieldInputLabel', function () {

  var $parentScope;
  var digestedScope;
  var html;

  beforeEach(function () {
    module('bulbs.cms.page.form.input.label');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element(
        '<form>' +
          '<page-form-field-input-label></page-form-field-input-label>' +
        '</form>'
      );
      digestedScope = window.testHelper.directiveBuilder($compile, $parentScope, html);
    });
  });

  it('should create a label with its `for` attribute set to given name', function () {
    var name = 'my_field_name';
    html.find('page-form-field-input-label').attr('name', name);

    digestedScope();

    expect(html.find('label').attr('for')).to.equal(name);
  });

  it('should create a label with its contents as the given schema label', function () {
    var title = 'My Field Title';
    $parentScope.schema = { label: title };
    html.find('page-form-field-input-label').attr('schema', 'schema');

    digestedScope();

    expect(html.find('label').html()).to.equal(title);
  });
});
