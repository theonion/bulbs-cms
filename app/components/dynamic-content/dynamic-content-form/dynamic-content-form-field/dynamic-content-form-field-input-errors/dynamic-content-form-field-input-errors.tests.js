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

    expect(html.html()).to.have.string(label + ' is required!');
  });

  it('should render a min error if errors has min: true', function () {
    var label = 'Garbage Title';
    $parentScope.schema = {
      label: label,
       min_value: 11
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { min: true } };
    $parentScope.$digest();

    expect(html.html()).to.have.string(label + ' must be greater than 11');
  });

  it('should render a max error if errors has max: true', function () {
    var label = 'Garbage Title';
    $parentScope.schema = {
      label: label,
      max_value: 11
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { max: true } };
    $parentScope.$digest();

    expect(html.html()).to.have.string(label + ' must be less than 11');
  });

  it('should render a integer error if errors has integer: true', function () {
    var label = 'Garbage Title';
    $parentScope.schema = {
      label: label,
    };
    html.find('dynamic-content-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { integer: true } };
    $parentScope.$digest();

    expect(html.html()).to.have.string(label + ' must be an integer.');
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
    expect(html.html())
      .to.have.string(label + ' is ' + len + ' characters too long!');
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

    expect(html.html()).to.have.string(label + ' must be formatted as an rgb hex. eg: "#000000".');
  });
});
