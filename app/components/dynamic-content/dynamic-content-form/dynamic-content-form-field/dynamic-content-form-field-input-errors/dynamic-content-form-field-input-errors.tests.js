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

  it('should render out a max length error if schema has a max_length', function () {
    var label = 'Garbage Title';
    var maxLength = 10;
    var value = 'some garbage title';
    $parentScope.schema = {
      label: label,
      max_length: maxLength
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = {
      $error: { maxlength: true },
      $viewValue: value
    };
    $parentScope.$digest();

    var len = value.length - maxLength;
    expect(html.html().indexOf(label + ' is ' + len + ' characters too long!') > -1)
      .to.equal(true);
  });
});
