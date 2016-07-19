'use strict';

describe('Directive: dynamicContentFormFieldInputLabel', function () {

  var $parentScope;
  var digestedScope;
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.input.label');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element(
        '<form>' +
          '<dynamic-content-form-field-input-label></dynamic-content-form-field-input-label>' +
        '</form>'
      );
      digestedScope = window.testHelper.directiveBuilder($compile, $parentScope, html);
    });
  });

  it('should create a label with its `for` attribute set to given name', function () {
    var name = 'my_field_name';
    html.find('dynamic-content-form-field-input-label').attr('name', name);

    digestedScope();

    expect(html.find('label').attr('for')).to.equal(name);
  });

  it('should create a label with its contents as the given schema label', function () {
    var title = 'My Field Title';
    $parentScope.schema = { label: title };
    html.find('dynamic-content-form-field-input-label').attr('schema', 'schema');

    digestedScope();

    expect(html.find('label').html()).to.have.string(title);
  });

  it('should fill label with key name if not given a schema label', function () {
    var name = 'title';
    var label = 'My Field Title';
    $parentScope.schema = {};
    $parentScope.name = name;
    html.find('dynamic-content-form-field-input-label')
      .attr('name', '{{ name }}')
      .attr('schema', 'schema');

    digestedScope();

    expect(html.find('label').html()).to.have.string(name);
  });
});
