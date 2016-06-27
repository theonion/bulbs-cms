'use strict';

describe('Directive: pageFormFieldInputErrors', function () {

  var $parentScope;
  var digestedScope;
  var formName = 'myForm';
  var inputName = 'garbage';
  var html;

  beforeEach(function () {
    module('bulbs.cms.page.form.input.errors');
    module('jsTemplates');

    inject(function ($compile, $rootScope) {
      $parentScope = $rootScope.$new();
      html = angular.element(
        '<form name="' + formName + '">' +
          '<page-form-field-input-errors></page-form-field-input-errors>' +
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
    html.find('page-form-field-input-errors')
      .attr('name', inputName)
      .attr('schema', 'schema');
    digestedScope();

    html.scope()[formName][inputName] = { $error: { required: true } };
    $parentScope.$digest();

    expect(html.html().indexOf(label + ' is required!') > -1).to.be.true;
  });
});
