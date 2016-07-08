'use strict';

describe('Directive: dynamicContentFormFieldInputErrors', function () {

  var $parentScope;
  var digestedScope;
  var formName = 'myForm';
  var inputName = 'garbage';
  var html;

  beforeEach(function () {
    module('bulbs.cms.dynamicContent.form.input.errors');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element(
        '<form name="' + formName + '">' +
          '<dynamic-content-form-field-input-errors></dynamic-content-form-field-input-errors>' +
        '</form>'
      );
      digestedScope = window.testHelper.directiveBuilder($compile, $parentScope, html);
    });
  });

  it('should render out a required error if schema has required === true', function () {
    var label = 'Garbage Title';
    $parentScope.schema = {
      label: label,
      required: true
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { required: true } };
    $parentScope.$digest();

    expect(html.html().indexOf(label + ' is required!') > -1).to.equal(true);
  });

	it('should render an rgbex herror if errors has rgbhex: true', function () {
    var label = 'Garbage Title';
    $parentScope.schema = {
      label: label,
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { rgbhex: true } };
    $parentScope.$digest();

    expect(html.html()).to.have.string(label + ' must be formatted as an rgb hex. eg: #000000');
  });
});
